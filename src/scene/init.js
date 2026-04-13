import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/Orbitcontrols.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200000);
    camera.position.set(80000, 30000, 100000);
    camera.lookAt(0, 0, 0);

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

    return {scene, camera, renderer, controls};
}