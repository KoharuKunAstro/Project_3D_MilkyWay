import * as THREE from 'three';
import { createGlowSphereMaterial } from './glowSphereMaterials.js';
import { R_Sun } from '../config.js';

const CRITERIA_COLORS = {
    CO:   0xff3333,
    H2O:  0xffaa00,
    OH:   0x3399ff,
    'HCO+': 0xe0e0e0
};

// Функция преобразования астрономических координат в декартовы

function astroToCartesian(l, b, r, scale = 3.26) {
    const lRad = l * Math.PI / 180;
    const bRad = b * Math.PI / 180;
    const x = (r * scale) * Math.cos(lRad) * Math.cos(bRad) - R_Sun;
    const y = (r * scale) * Math.sin(lRad) * Math.cos(bRad);
    const z = (r * scale) * Math.sin(bRad);
    return new THREE.Vector3(x, y, z);
}

export function createObjectMaterials(data, baseRadius = 40) {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(1, 48, 48);

    data.forEach(item => {
        // Сохраняем значения всех молекул
        const moleculeValues = {};
        for (const key of Object.keys(CRITERIA_COLORS)) {
            const val = item[key];
            moleculeValues[key] = (typeof val === 'number' && !Number.isNaN(val)) ? val : 0;
        }

        // Временный материал (будет пересчитан фильтрами)
        const material = createGlowSphereMaterial(0x000000, 0, 2.5);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.scale.setScalar(baseRadius);

        // --- НОВАЯ ПОЗИЦИЯ через astroToCartesian ---
        const r = item.r ?? 500;
        const pos = astroToCartesian(item.l, item.b, r, 3.2);
        sphere.position.copy(pos);

        sphere.userData = {
            moleculeValues,
            material,
            rawData: item
        };
        group.add(sphere);
    });

    return group;
}

export function updateMaterialsByFilters(objectsGroup, activeMoleculeSet) {
    if (!objectsGroup) return;
    const anyActive = activeMoleculeSet.size > 0;

    objectsGroup.children.forEach(sphere => {
        const { moleculeValues, material } = sphere.userData;
        if (!anyActive) {
            sphere.visible = false;
            return;
        }

        let totalWeight = 0;
        const color = new THREE.Color(0, 0, 0);
        let maxValue = 0;

        for (const [key, hexColor] of Object.entries(CRITERIA_COLORS)) {
            if (!activeMoleculeSet.has(key)) continue;
            const val = moleculeValues[key];
            if (val > 0) {
                totalWeight += val;
                color.add(new THREE.Color(hexColor).multiplyScalar(val));
                if (val > maxValue) maxValue = val;
            }
        }

        if (totalWeight === 0) {
            sphere.visible = false;
            return;
        }

        color.multiplyScalar(1 / totalWeight);
        const intensity = Math.min(maxValue, 6);
        if (material && material.uniforms) {
            material.uniforms.uColor.value = color;
            material.uniforms.uIntensity.value = intensity;
        }
        sphere.visible = true;
    });
}