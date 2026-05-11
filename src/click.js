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

    // Обновление информационных панелей
    function updateInfoPanel(data) {
        // Координаты
        document.getElementById('coordL').innerText = data.l?.toFixed(2) ?? '—';
        document.getElementById('coordB').innerText = data.b?.toFixed(2) ?? '—';
        document.getElementById('distanceR').innerText = data.r?.toFixed(0) ?? '—';
        document.getElementById('velocityV').innerText = data.v_r?.toFixed(1) ?? '—';
        
        // Светимость (сумма интенсивностей)
        let totalIntensity = (data.CO || 0) + (data.H2O || 0) + (data.OH || 0) + (data['HCO+'] || 0);
        document.getElementById('luminosityL').innerText = totalIntensity.toFixed(2);
        
        // Имя объекта в панели легенды
        const legendTitle = document.querySelector('.legend-title');
        if (legendTitle) {
            legendTitle.innerHTML = `⭐ ${data.Name || 'Объект'}`;
        }
        
        // Анимация панелей (мигание)
        const panels = ['.coord-box', '.luminosity-box'];
        panels.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.classList.remove('data-updated');
                void el.offsetWidth; // принудительная перерисовка
                el.classList.add('data-updated');
            }
        });
    }

    function clearInfoPanel() {
        document.getElementById('coordL').innerText = '—';
        document.getElementById('coordB').innerText = '—';
        document.getElementById('distanceR').innerText = '—';
        document.getElementById('velocityV').innerText = '—';
        document.getElementById('luminosityL').innerText = '—';
        const legendTitle = document.querySelector('.legend-title');
        if (legendTitle && !legendTitle.innerHTML.includes('МОЛЕКУЛЫ')) {
            legendTitle.innerHTML = '⭐ МОЛЕКУЛЫ';
        }
    }

    function resetSelection() {
        if (lastSelectedSphere) {
            lastSelectedSphere.scale.setScalar(baseRadius);
            lastSelectedSphere = null;
        }
    }

    // Обработчик клика
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