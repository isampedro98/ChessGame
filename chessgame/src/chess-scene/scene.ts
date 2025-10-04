import * as THREE from 'three';
import { BACKGROUND_COLOR } from './constants';

export const createRenderer = (canvas: HTMLCanvasElement) => {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
