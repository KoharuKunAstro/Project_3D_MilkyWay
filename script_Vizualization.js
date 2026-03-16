import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// Константы (характеристики галактики)

const Total_Points = 500000
const R_Disk = 50000
const R_Buldge = 3260
const R_Galo = 100000

//  Функция генерации толщины диска

function getDiskHalfThikness(radius) {
    
    const points = [
        { r: 0,  h: 1500 },
        { r: 26000, h: 500},
        { r: 50000, h: 150}
    ];

    if (radius <= points[0].r) return points[0].h;
    if (radius >= ponits[2].r) return points[2].h;
    
    for (let i = 0; i < 2; i++) {
        if (radius >= points[i].r && radius <= points[i + 1].r) {
            const t = (radius - points[i].r) / (points[i + 1].r - points[i].r);
            return points[i].h * (1 - t) + points[i + 1].h;
        }
    }

    return points[2].h;
}

// Всё ещё константы

const Arms_Count = 4;
const Pitch_Angle = -12 * Math.PI / 180;
const Spiral_Tightness = 1 / Math.tan(Pitch_Angle);
const Arm_R0 = 4000;
const Arm_Sigma_angle = 0.25;
const Arm_Sigma_r = 0.1;

const Fraction_Buldge = 0.1
const Fraction_Disk = 0.8
const Fraction_Galo = 0.1

const Fraction_Arms = 0.6

// начало настройки сцены

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200000);
camera.position.set(80000, 30000, 100000);
camera.lookAt(0, 0 ,0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.nextPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.maxDistance = 200000;
controls.minDistance = 10000;