import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/Orbitcontrols.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);

    const container = document.getElementById('canvas-container')

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth/ container.clientHeight, 1, 200000);
    camera.position.set(0, -100000, 10000);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.maxDistance = 200000;
    controls.minDistance = 10000;

    return {scene, camera, renderer, controls, container};
}