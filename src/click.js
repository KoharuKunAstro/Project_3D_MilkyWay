import * as THREE from 'three';

export function initClickHandler({ objectsGroup, renderer, camera, baseRadius = 350, highlightScale = 1.2 }) {
    if (!objectsGroup || !renderer || !camera) {
        console.warn('initClickHandler: missing required parameters');
        return;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastSelectedSphere = null;
    const highlightRadius = baseRadius * highlightScale;

    function updateInfoPanel(data) {
        // Название объекта
        document.getElementById('objectName').innerText = data.Name || '—';

        // Координаты
        document.getElementById('coordL').innerText = data.l?.toFixed(2) ?? '—';
        document.getElementById('coordB').innerText = data.b?.toFixed(2) ?? '—';
        document.getElementById('distanceR').innerText = data.r?.toFixed(0) ?? '—';

        // Скорость
        document.getElementById('velocityV').innerText = data.v_r?.toFixed(1) ?? '—';

        // Интенсивность (сумма)
        let totalIntensity = (data.CO || 0) + (data.H2O || 0) + (data.OH || 0) + (data['HCO+'] || 0);
        document.getElementById('luminosityL').innerText = totalIntensity.toFixed(2);

        // Переходы: теперь это объект { CO: [...], OH: [...], ... }
        let transitionsText = '—';
        if (data.Transitions) {
            const parts = [];
            // Проходим по молекулам, которые сейчас отображаются (можно фильтровать по активным)
            const molecules = ['CO', 'OH', 'H2O', 'HCO+'];
            molecules.forEach(mol => {
                if (data.Transitions[mol]) {
                    parts.push(`${mol}: ${data.Transitions[mol].join(', ')}`);
                }
            });
            transitionsText = parts.length > 0 ? parts.join('; ') : '—';
        }
        document.getElementById('transitionValue').innerText = transitionsText;

        // Анимация обновления
        const panels = ['.coord-box', '.intensity-velocity-box'];
        panels.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.classList.remove('data-updated');
                void el.offsetWidth;
                el.classList.add('data-updated');
            }
        });
    }

    function clearInfoPanel() {
        document.getElementById('objectName').innerText = '—';
        document.getElementById('coordL').innerText = '—';
        document.getElementById('coordB').innerText = '—';
        document.getElementById('distanceR').innerText = '—';
        document.getElementById('velocityV').innerText = '—';
        document.getElementById('luminosityL').innerText = '—';
        document.getElementById('transitionValue').innerText = '—';
    }

    function resetSelection() {
        if (lastSelectedSphere) {
            lastSelectedSphere.scale.setScalar(baseRadius);
            lastSelectedSphere = null;
        }
    }

    window.addEventListener('click', (event) => {
        if (!objectsGroup) return;

        const rect = renderer.domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objectsGroup.children);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const rawData = hit.object.userData.rawData;
            if (rawData) {
                updateInfoPanel(rawData);
                resetSelection();
                hit.object.scale.setScalar(highlightRadius);
                lastSelectedSphere = hit.object;
                setTimeout(() => {
                    if (lastSelectedSphere === hit.object) {
                        resetSelection();
                    }
                }, 500);
                return;
            }
        }
        // Клик мимо
        clearInfoPanel();
        resetSelection();
    });
}