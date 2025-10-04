import * as THREE from 'three';
import { PIECE_HEIGHT } from './constants';

const createLathe = (profile: Array<[number, number]>) =>
    new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 48);

// Lathe-based
export const pawnGeometry = createLathe([
    [0, 0], [0.35, 0], [0.45, 0.05], [0.38, 0.2], [0.28, 0.35],
    [0.3, 0.45], [0.2, 0.6], [0.15, 0.7], [0, PIECE_HEIGHT],
]);

export const bishopGeometry = createLathe([
    [0, 0], [0.4, 0], [0.45, 0.08], [0.32, 0.25], [0.26, 0.5],
    [0.2, 0.65], [0.16, 0.8], [0.1, 0.95], [0, 1.1],
]);

export const queenGeometry = createLathe([
    [0, 0], [0.42, 0], [0.46, 0.1], [0.35, 0.3], [0.32, 0.6],
    [0.28, 0.85], [0.22, 0.95], [0.16, 1.05], [0, 1.2],
]);

export const kingGeometry = createLathe([
    [0, 0], [0.44, 0], [0.48, 0.1], [0.36, 0.35], [0.32, 0.7],
    [0.26, 0.95], [0.18, 1.1], [0, 1.25],
]);

// Rook
export const rookBody = new THREE.CylinderGeometry(0.28, 0.32, 0.6, 24);
export const rookBase = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
export const rookCrown = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
export const rookMerlon = new THREE.BoxGeometry(0.12, 0.2, 0.18);

// Knight
export const knightBaseLower = new THREE.CylinderGeometry(0.35, 0.4, 0.18, 32);
export const knightBaseUpper = new THREE.CylinderGeometry(0.28, 0.32, 0.18, 32);
export const knightBody = new THREE.BoxGeometry(0.35, 0.45, 0.2);
export const knightHead = new THREE.BoxGeometry(0.25, 0.3, 0.15);
export const knightSnout = new THREE.BoxGeometry(0.2, 0.15, 0.1);
export const knightEar = new THREE.ConeGeometry(0.05, 0.1, 8);

// Common / crowns
export const crownSphere = new THREE.SphereGeometry(0.07, 16, 16);
export const regalSphere = new THREE.SphereGeometry(0.1, 16, 16);
export const crossVertical = new THREE.BoxGeometry(0.08, 0.3, 0.08);
export const crossHorizontal = new THREE.BoxGeometry(0.26, 0.08, 0.08);
