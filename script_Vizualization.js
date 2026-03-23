import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// Константы (характеристики галактики)

const Total_Points = 500000
const R_Disk = 50000
const R_Buldge = 3260
const R_Galo = 100000

//  Функции генераци диска

function randomDiskRadius() {
    
    const scale = 12000;
    
    let r;
    
    do {
        r = -scale * Math.log(1 - Math.random());
    } while (r > R_Disk)
    
    return r;
}

function randn() {
    
    let u = 0, v = 0;
    
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function getDiskHalfThiсkness(radius) {
    
    const points = [
        { r: 0,  h: 1500 },
        { r: 26000, h: 500},
        { r: 50000, h: 150}
    ];

    if (radius <= points[0].r) return points[0].h;
    if (radius >= points[2].r) return points[2].h;
    
    for (let i = 0; i < 2; i++) {
        if (radius >= points[i].r && radius <= points[i + 1].r) {
            const t = (radius - points[i].r) / (points[i + 1].r - points[i].r);
            return points[i].h * (1 - t) + points[i + 1].h * t;
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.maxDistance = 200000;
controls.minDistance = 10000;

//Выделяем память

const position = new Float32Array(Total_Points * 3);
const colors = new Float32Array(Total_Points * 3);

let countBulge = 0, countDisk = 0, countHalo = 0;
let x, y, z;
let r, g, b;

// Генерация точек
for (let i = 0; i < Total_Points; i++) {
    
    const typeRand = Math.random();
    let type;
    
    if (typeRand < Fraction_Buldge) {
        type = 'bulge';
        countBulge++;
    } else if (typeRand < Fraction_Buldge + Fraction_Disk) {
        type = 'disk';
        countDisk++;
    } else {
        type = 'halo';
        countHalo++;
    }
    
    if (type === 'bulge') {
    
    const radius = R_Buldge * Math.pow(Math.random(), 2);
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();
    
    x = radius * Math.sin(theta) * Math.cos(phi);
    y = radius * Math.sin(theta) * Math.sin(phi);
    z = radius * Math.cos(theta);
    
    r = 1.0;
    g = 0.8 + 0.2 * Math.random();
    b = 0.5 + 0.2 * Math.random();
    
    } else if (type === 'halo') {
        
        const radius = R_Galo * Math.cbrt(Math.random());
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();
    
        x = radius * Math.sin(theta) * Math.cos(phi);
        y = radius * Math.sin(theta) * Math.sin(phi);
        z = radius * Math.cos(theta);
        
        r = 0.8;
        g = 0.4 + 0.3 * Math.random();
        b = 0.4 + 0.3 * Math.random();
        
    } else {
        
        const isArm = Math.random() < Fraction_Arms;
        
        let radius, angle;
        
        if (isArm) {
            const armIndex = Math.floor(Math.random() * Arms_Count);
            const phase = (armIndex / Arms_Count) * 2 * Math.PI;
        
            let rArm;
            do {
                rArm = randomDiskRadius();
            } while (rArm < Arm_R0);
        
            rArm *= (1 + Arm_Sigma_r * randn());
            if (rArm > R_Disk) rArm = R_Disk * 0.99;
            if (rArm < Arm_R0) rArm = Arm_R0;
        
            radius = rArm;
            
            const angleCenter = phase + Spiral_Tightness * Math.log(rArm / Arm_R0);
            angle = angleCenter + Arm_Sigma_angle * randn();
            
        } else {
            
            radius = randomDiskRadius()
            
            angle = 2 * Math.PI * Math.random();
            
        }
        
        const halfThickness = getDiskHalfThickness(radius);
        z = (Math.random() - 0.5) * 2 * halfThickness;
        
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        
        if (isArm) {
            
            r = 0.7 + 0.3 * Math.random();
            g = 0.7 + 0.3 * Math.random();
            b = 1.0;
            
        } else {
            r = 1.0;
            g = 1.0;
            b = 0.8 + 0.2 * Math.random();
        }
    }
    
    position[i * 3] = x;
    position[i * 3 + 1] = y;
    position[i * 3 + 2] = z;
    
    colors[i *3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
}

// Создание графических параметров точек

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');

ctx.beginPath();
ctx.arc(16, 16, 14, 0, 2 * Math.PI);
ctx.fillStyle = 'white';
ctx.fill();

const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.6, 'rgba(255,255,255,0.8)');
gradient.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);

const texture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
    
    size: 60,
    map: texture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
    
});

const points = new THREE.Points(geometry, material);
scene.add(points);

scene.fog = new THREE.FogExp2(0x050510, 0.000005); // Туман

function animate() {
    
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate(); // Анимация

// Изменение размеров при изменении окна.

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
} 

