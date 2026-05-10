import * as THREE from 'three';
import {Total_Points, Fraction_Buldge, Fraction_Disk} from './config.js';
import { generateBuldgePoint } from './generators/bulge.js';
import { generateDiskPoint } from './generators/disk.js';
import { generateHaloPoint } from './generators/halo.js';
import { initScene } from './scene/init.js';
import { initPostProcessing } from './scene/postprocessing.js';
import { createStarMaterial } from './materials/starMaterials.js';
import { createObjectMaterials, updateMaterialsByFilters } from './materials/objectMaterials.js';

const {scene, camera, renderer, controls, container} = initScene();
const {composer, bloomPass} = initPostProcessing(renderer, scene, camera);

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

let objectsGroup;

fetch('merged_objects.json')
   .then(res => res.json())
   .then(data => {
      objectsGroup = createObjectMaterials(data, 350); // радиус 50
      scene.add(objectsGroup);

      function applyFilters() {
          const activeMolecules = new Set();
          document.querySelectorAll('.filter-checkbox').forEach(cb => {
              if (cb.checked) {
                  const filter = cb.getAttribute('data-filter');
                  switch(filter) {
                      case 'co': activeMolecules.add('CO'); break;
                      case 'oh': activeMolecules.add('OH'); break;
                      case 'h2o': activeMolecules.add('H2O'); break;
                      case 'hco': activeMolecules.add('HCO+'); break;
                  }
              }
          });
          updateMaterialsByFilters(objectsGroup, activeMolecules);
      }

      document.querySelectorAll('.filter-checkbox').forEach(cb => {
          cb.addEventListener('change', applyFilters);
      });
      applyFilters(); // начальное состояние (все фильтры включены)
   });
   
// Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();

// Ресайз
window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.resolution.set(w, h);   // ← это обязательно
});