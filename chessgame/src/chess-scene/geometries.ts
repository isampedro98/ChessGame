import * as THREE from 'three';

const createLathe = (profile: Array<[number, number]>, segments = 80) =>
  new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments);

export const pawnGeometry = createLathe([
  [0, 0], [0.38, 0], [0.40, 0.06], [0.35, 0.10],
  [0.30, 0.12], [0.28, 0.16],
  [0.22, 0.24], [0.19, 0.50],
  [0.16, 0.64], [0.12, 0.74], [0.08, 0.82], [0, 0.88],
]);

export const bishopGeometry = createLathe([
  [0, 0], [0.36, 0], [0.38, 0.06], [0.36, 0.10],
  [0.28, 0.22], [0.24, 0.62], [0.20, 0.78], [0.16, 0.90],
  [0.10, 1.00], [0.06, 1.06], [0, 1.12],
]);

export const queenGeometry = createLathe([
  [0, 0], [0.38, 0], [0.40, 0.08], [0.38, 0.14],
  [0.30, 0.36], [0.26, 0.76], [0.22, 1.04], [0.16, 1.16], [0.08, 1.22], [0, 1.30],
]);

export const kingGeometry = createLathe([
  [0, 0], [0.40, 0], [0.42, 0.08], [0.40, 0.14],
  [0.32, 0.38], [0.28, 0.80], [0.22, 1.10], [0.12, 1.24], [0, 1.34],
]);

export const rookBody = new THREE.CylinderGeometry(0.21, 0.21, 0.70, 64);
export const rookBase = new THREE.CylinderGeometry(0.29, 0.29, 0.14, 64);
export const rookCrown = new THREE.CylinderGeometry(0.25, 0.25, 0.06, 48);
export const rookMerlon = new THREE.BoxGeometry(0.07, 0.18, 0.11);

export const knightBaseLower = new THREE.CylinderGeometry(0.30, 0.36, 0.16, 48);
export const knightBaseUpper = new THREE.CylinderGeometry(0.24, 0.30, 0.16, 48);
export const knightBody = new THREE.BoxGeometry(0.24, 0.52, 0.16);
export const knightHead = new THREE.BoxGeometry(0.18, 0.30, 0.12);
export const knightSnout = new THREE.BoxGeometry(0.14, 0.12, 0.08);
export const knightEar = new THREE.ConeGeometry(0.045, 0.11, 10);

export const crownSphere = new THREE.SphereGeometry(0.065, 20, 20);
export const regalSphere = new THREE.SphereGeometry(0.09, 20, 20);
export const crossVertical = new THREE.BoxGeometry(0.06, 0.32, 0.06);
export const crossHorizontal = new THREE.BoxGeometry(0.22, 0.06, 0.06);

