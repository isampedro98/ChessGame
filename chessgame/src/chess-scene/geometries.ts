import * as THREE from 'three';

// Perfiles más esbeltos inspirados en Staunton
const createLathe = (profile: Array<[number, number]>, segments = 64) =>
  new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments);

// Pawn
export const pawnGeometry = createLathe([
  [0, 0], [0.30, 0], [0.36, 0.05], [0.28, 0.16], [0.22, 0.28],
  [0.20, 0.42], [0.14, 0.58], [0.10, 0.72], [0.06, 0.88], [0, 0.98],
]);

// Bishop
export const bishopGeometry = createLathe([
  [0, 0], [0.34, 0], [0.38, 0.06], [0.26, 0.20], [0.20, 0.45],
  [0.14, 0.68], [0.10, 0.88], [0.06, 1.02], [0, 1.12],
]);

// Queen (aro y perlas aparte)
export const queenGeometry = createLathe([
  [0, 0], [0.34, 0], [0.38, 0.08], [0.28, 0.28], [0.22, 0.58],
  [0.18, 0.86], [0.14, 1.02], [0.08, 1.16], [0, 1.26],
]);

// King
export const kingGeometry = createLathe([
  [0, 0], [0.36, 0], [0.40, 0.08], [0.30, 0.30], [0.22, 0.66],
  [0.16, 0.96], [0.10, 1.12], [0, 1.30],
]);

// Rook (más estrecha y alta)
export const rookBody = new THREE.CylinderGeometry(0.22, 0.26, 0.68, 32);
export const rookBase = new THREE.CylinderGeometry(0.34, 0.34, 0.14, 32);
export const rookCrown = new THREE.CylinderGeometry(0.30, 0.30, 0.07, 24);
export const rookMerlon = new THREE.BoxGeometry(0.10, 0.20, 0.14);

// Knight (proporciones más esbeltas)
export const knightBaseLower = new THREE.CylinderGeometry(0.30, 0.34, 0.16, 32);
export const knightBaseUpper = new THREE.CylinderGeometry(0.24, 0.28, 0.16, 32);
export const knightBody = new THREE.BoxGeometry(0.28, 0.50, 0.18);
export const knightHead = new THREE.BoxGeometry(0.22, 0.30, 0.14);
export const knightSnout = new THREE.BoxGeometry(0.16, 0.14, 0.10);
export const knightEar = new THREE.ConeGeometry(0.045, 0.11, 10);

// Comunes / coronas
export const crownSphere = new THREE.SphereGeometry(0.065, 16, 16);
export const regalSphere = new THREE.SphereGeometry(0.09, 16, 16);
export const crossVertical = new THREE.BoxGeometry(0.06, 0.32, 0.06);
export const crossHorizontal = new THREE.BoxGeometry(0.22, 0.06, 0.06);
