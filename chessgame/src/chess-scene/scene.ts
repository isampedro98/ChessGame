import * as THREE from 'three';
import { BACKGROUND_COLOR } from './constants';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const createRenderer = (canvas: HTMLCanvasElement) => {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    return renderer;
};

export const createSceneAndCamera = (canvas: HTMLCanvasElement) => {
    const scene = new THREE.Scene();
    scene.background = BACKGROUND_COLOR;

    const camera = new THREE.PerspectiveCamera(
        42,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100,
    );
    camera.position.set(6, 9, 9);
    camera.lookAt(0, 0, 0);

    return { scene, camera };
};

export const applyStudioEnvironment = (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
};
