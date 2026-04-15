import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- НАСТРОЙКИ СЦЕНЫ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- УПРАВЛЕНИЕ ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableZoom = true;
controls.maxDistance = 60;

// --- ОСВЕЩЕНИЕ ---
const ambientLight = new THREE.AmbientLight(0x202030);
scene.add(ambientLight);
const coreLight = new THREE.PointLight(0xffaa55, 2, 50);
coreLight.position.set(0, 0, 0);
scene.add(coreLight);

// --- ЯДРО ГАЛАКТИКИ ---
const coreGeo = new THREE.SphereGeometry(1.5, 64, 64);
const coreMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0x442200 });
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

const glowGeo = new THREE.SphereGeometry(2.3, 32, 32);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.15 });
const glow = new THREE.Mesh(glowGeo, glowMat);
scene.add(glow);

// --- МАССИВЫ ---
const backgroundStars = [];
const specialObjects = [];

// --- ФУНКЦИЯ ФОНОВОЙ ЗВЕЗДЫ ---
function createBackgroundStar(x, y, z) {
    const geo = new THREE.SphereGeometry(0.06, 4);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x222222 });
    const star = new THREE.Mesh(geo, mat);
    star.position.set(x, y, z);
    return star;
}

// --- СОЗДАНИЕ ОСОБЫХ ОБЪЕКТОВ С РЕАЛИСТИЧНЫМИ ПАРАМЕТРАМИ ---
const objectTypes = [
    { name: 'Красный гигант', color: 0xff5533, size: 0.45, temp: '3800', lum: '120', mass: '2.2' },
    { name: 'Голубой сверхгигант', color: 0x4488ff, size: 0.55, temp: '35000', lum: '42000', mass: '22' },
    { name: 'Пульсар', color: 0xaaccff, size: 0.28, temp: '850000', lum: '0.25', mass: '1.5' },
    { name: 'Нейтронная звезда', color: 0xffeedd, size: 0.22, temp: '120000', lum: '0.008', mass: '1.4' },
    { name: 'Жёлтый карлик', color: 0xffcc44, size: 0.32, temp: '5780', lum: '1.02', mass: '1.0' },
    { name: 'Белый карлик', color: 0xcceeff, size: 0.24, temp: '15000', lum: '0.012', mass: '0.65' },
    { name: 'Чёрная дыра', color: 0x111111, size: 0.5, temp: '0', lum: '0', mass: '12' }
];

function createSpecialObject(x, y, z) {
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    
    // Генерация галактических координат (l, b) в градусах
    const l_rad = Math.atan2(z, x);
    const b_rad = Math.asin(y / Math.sqrt(x*x + y*y + z*z));
    const l_deg = (l_rad * 180 / Math.PI + 360) % 360;
    const b_deg = b_rad * 180 / Math.PI;
    const distance = Math.sqrt(x*x + y*y + z*z).toFixed(1);
    const velocity = (Math.random() * 250 + 50).toFixed(0);
    
    // Светимость в L☉ с небольшой вариацией
    let luminosity = parseFloat(type.lum);
    if (type.name !== 'Чёрная дыра' && type.name !== 'Пульсар') {
        luminosity = (luminosity * (0.8 + Math.random() * 0.6)).toFixed(1);
    } else {
        luminosity = luminosity.toFixed(2);
    }
    
    const starData = {
        name: type.name,
        temperature: type.temp,
        luminosity: luminosity,
        mass: type.mass,
        galactic_l: l_deg.toFixed(1),
        galactic_b: b_deg.toFixed(1),
        distance: distance,
        velocity: velocity,
        coordX: x.toFixed(1),
        coordY: y.toFixed(1),
        coordZ: z.toFixed(1),
        typeColor: type.color
    };
    
    const geo = new THREE.SphereGeometry(type.size, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: type.color,
        emissive: new THREE.Color(type.color).multiplyScalar(0.5),
        emissiveIntensity: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.userData = starData;
    return mesh;
}

// --- ФОНОВЫЕ ЗВЁЗДЫ (диск + рукава) ---
for (let i = 0; i < 5500; i++) {
    const radius = Math.pow(Math.random(), 1.5) * 14;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 2.2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = height;
    const star = createBackgroundStar(x, y, z);
    scene.add(star);
    backgroundStars.push(star);
}

// Рукава
for (let a = 0; a < 4; a++) {
    for (let i = 0; i < 500; i++) {
        const t = i / 500;
        const radius = 2.5 + t * 12.5;
        const angle = (a / 4) * Math.PI * 2 + t * 7 + (Math.random() - 0.5) * 0.4;
        const height = (Math.random() - 0.5) * 1.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = height;
        const star = createBackgroundStar(x, y, z);
        scene.add(star);
        backgroundStars.push(star);
    }
}

// --- ОСОБЫЕ ОБЪЕКТЫ (20 штук) ---
for (let i = 0; i < 20; i++) {
    let radius, angle, height;
    if (i < 6) {
        radius = Math.random() * 3.5;
        angle = Math.random() * Math.PI * 2;
        height = (Math.random() - 0.5) * 1.2;
    } else if (i < 14) {
        radius = 4 + Math.random() * 7;
        angle = (Math.floor(Math.random() * 4) / 4) * Math.PI * 2 + Math.random() * 1.2;
        height = (Math.random() - 0.5) * 1.6;
    } else {
        radius = 8 + Math.random() * 7;
        angle = Math.random() * Math.PI * 2;
        height = (Math.random() - 0.5) * 2;
    }
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = height;
    const obj = createSpecialObject(x, y, z);
    scene.add(obj);
    specialObjects.push(obj);
}

// --- ТУМАННОСТИ ---
for (let i = 0; i < 8; i++) {
    const fogGeo = new THREE.SphereGeometry(2.5 + Math.random() * 6, 16);
    const fogMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.65, 0.5, 0.12),
        transparent: true,
        opacity: 0.018,
        side: THREE.BackSide
    });
    const fog = new THREE.Mesh(fogGeo, fogMat);
    fog.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 20);
    scene.add(fog);
}

// --- РЕЙКАСТИНГ И ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function updateUI(data) {
    // Обновляем координаты (l, b)
    const lElem = document.getElementById('coordL');
    const bElem = document.getElementById('coordB');
    const distElem = document.getElementById('distanceR');
    const velElem = document.getElementById('velocityV');
    const lumElem = document.getElementById('luminosityL');
    
    if (lElem) lElem.textContent = data.galactic_l + '°';
    if (bElem) bElem.textContent = data.galactic_b + '°';
    if (distElem) distElem.textContent = data.distance + ' пк';
    if (velElem) velElem.textContent = data.velocity + ' км/с';
    
    // Светимость с символом Солнца
    let lumText = data.luminosity;
    if (!isNaN(parseFloat(data.luminosity))) {
        lumText = data.luminosity + ' L☉';
    }
    if (lumElem) lumElem.textContent = lumText;
    
    // Добавляем анимацию мерцания данных
    const panels = ['.coord-box', '.luminosity-box'];
    panels.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
            el.classList.add('data-updated');
            setTimeout(() => el.classList.remove('data-updated'), 300);
        }
    });
}

function hideUI() {
    document.getElementById('coordL').textContent = '—';
    document.getElementById('coordB').textContent = '—';
    document.getElementById('distanceR').textContent = '—';
    document.getElementById('velocityV').textContent = '—';
    document.getElementById('luminosityL').textContent = '—';
}

renderer.domElement.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(specialObjects);
    
    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (hoveredObject !== obj) {
            if (hoveredObject) {
                hoveredObject.material.emissive.setHex(hoveredObject.userData.oldEmissive || 0x000000);
                hoveredObject.scale.set(1, 1, 1);
            }
            if (!obj.userData.oldEmissive) obj.userData.oldEmissive = obj.material.emissive.getHex();
            obj.material.emissive.setHex(0xffaa66);
            obj.scale.set(1.25, 1.25, 1.25);
            updateUI(obj.userData);
            hoveredObject = obj;
        }
    } else {
        if (hoveredObject) {
            hoveredObject.material.emissive.setHex(hoveredObject.userData.oldEmissive || 0x000000);
            hoveredObject.scale.set(1, 1, 1);
            hoveredObject = null;
            hideUI();
        }
    }
});

// --- АНИМАЦИЯ ---
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.002;
    const scale = 1 + Math.sin(time * 10) * 0.02;
    core.scale.set(scale, scale, scale);
    glow.scale.set(scale * 1.2, scale * 1.2, scale * 1.2);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Галактика загружена. Наведите курсор на яркие объекты.');
