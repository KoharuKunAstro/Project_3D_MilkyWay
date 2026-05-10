import * as THREE from 'three';
import { createGlowSphereMaterial } from './glowSphereMaterials.js';

const CRITERIA_COLORS = {
    CO:   0xff3333,
    H2O:  0xffaa00,
    OH:   0x3399ff,
    'HCO+': 0xe0e0e0
};

/**
 * Создаёт группу светящихся сфер на основе данных JSON.
 * @param {Array} data – массив объектов из JSON
 * @param {number} [baseRadius=40] – базовый радиус сфер
 * @returns {THREE.Group}
 */
export function createObjectMaterials(data, baseRadius = 40) {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(1, 48, 48);

    data.forEach(item => {
        // 1. Сбор значений критериев и вычисление цвета
        let totalWeight = 0;
        const color = new THREE.Color(0, 0, 0);
        let maxValue = 0; // для интенсивности

        for (const [key, hexColor] of Object.entries(CRITERIA_COLORS)) {
            const value = item[key];
            if (typeof value === 'number' && !Number.isNaN(value)) {
                totalWeight += value;
                color.add(new THREE.Color(hexColor).multiplyScalar(value));
                if (value > maxValue) maxValue = value;
            }
        }

        // Если нет ни одного критерия – серая сфера
        if (totalWeight === 0) {
            color.set(0x888888);
        } else {
            color.multiplyScalar(1 / totalWeight); // средневзвешенный цвет
        }

        // 2. Интенсивность = максимальное значение критерия, приведённое к 0…1
        //    (диапазон 1–6 → 0–1)
        const intensity = Math.min(maxValue, 6);

        // 3. Создаём материал
        const material = createGlowSphereMaterial(color, intensity, 2.5);

        // 4. Сфера
        const sphere = new THREE.Mesh(geometry, material);
        sphere.scale.setScalar(baseRadius);

        // 5. Позиция в декартовых координатах
        const lRad = item.l * Math.PI / 180;   // больше не зависит от THREE.MathUtils
        const bRad = item.b * Math.PI / 180;
        const r = item.r ?? 500;               // fallback на случай отсутствия r
        sphere.position.set(
            (r * 3.2) * Math.cos(lRad) * Math.cos(Math.PI / 2 - bRad),
            (r * 3.2) * Math.sin(Math.PI / 2 - bRad),
            (r * 3.2) * Math.sin(lRad) * Math.cos(Math.PI / 2 - bRad)
        );

        group.add(sphere);
    });

    return group;
}