import * as THREE from 'three';
import {Total_Points, Fraction_Buldge, Fraction_Disk} from './config.js';
import { generateBuldgePoint } from './generators/bulge.js';
import { generateDiskPoint } from './generators/disk.js';
import { generateHaloPoint } from './generators/halo.js';
import { initScene } from './scene/init.js';
import { initPostProcessing } from './scene/postprocessing.js';
import { createStarMaterial } from './materials/starmaterials.js';

const {scene, camera, renderer, controls, container} = initScene();
const composer = initPostProcessing(renderer, scene, camera);

const position = new Float32Array(Total_Points * 3);
const colors = new Float32Array(Total_Points * 3);

for (let i = 0; i < Total_Points; i++) {
    const rand = Math.random();
    let point;

     if (rand < Fraction_Buldge) {
        point = generateBuldgePoint();
     } else if (rand < Fraction_Buldge + Fraction_Disk) {
        point = generateDiskPoint();
     } else {
        point = generateHaloPoint()
     }

     position[i*3] = point.x;
     position[i*3 + 1] = point.y;
     position[i*3 + 2] = point.z;

     colors[i*3] = point.r;
     colors[i*3 + 1] = point.g;
     colors[i*3 + 2] = point.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = createStarMaterial();
const points = new THREE.Points(geometry, material);
scene.add(points);

// Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();

// Ресайз
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
});