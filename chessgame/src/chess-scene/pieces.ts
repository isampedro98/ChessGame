import * as THREE from 'three';
import {
    pawnGeometry, bishopGeometry, queenGeometry, kingGeometry,
    rookBody, rookBase, rookCrown, rookMerlon,
    knightBaseLower, knightBaseUpper, knightBody, knightHead,
    knightSnout, knightEar, crownSphere, regalSphere, crossVertical, crossHorizontal
} from './geometries';
import { PIECE_HEIGHT, SQUARE_SIZE } from './constants';

export const createMesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

export const positionPiece = (obj: THREE.Object3D, row: number, col: number) => {
    obj.position.set(
        (col - 3.5) * SQUARE_SIZE,
        PIECE_HEIGHT / 2,
        (row - 3.5) * SQUARE_SIZE,
    );
};

export const createPawn = (material: THREE.Material) => createMesh(pawnGeometry, material);

export const createBishop = (material: THREE.Material) => {
    const body = createMesh(bishopGeometry, material);
    const sphere = createMesh(regalSphere, material);
    sphere.position.y = 1.05;

    const tilt = createMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16), material);
    tilt.rotation.z = Math.PI / 4;
    tilt.position.set(0, 0.92, 0.14);

    const g = new THREE.Group();
    g.add(body, sphere, tilt);
    return g;
};

export const createQueen = (material: THREE.Material) => {
    const body = createMesh(queenGeometry, material);
    const crown = createMesh(new THREE.TorusGeometry(0.18, 0.035, 12, 24), material);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 1.05;

    const g = new THREE.Group();
    g.add(body, crown);

    const pearls = 6;
    for (let i = 0; i < pearls; i += 1) {
        const pearl = createMesh(crownSphere, material);
        const ang = (i / pearls) * Math.PI * 2;
        pearl.position.set(Math.cos(ang) * 0.22, 1.12, Math.sin(ang) * 0.22);
        g.add(pearl);
    }
    return g;
};

export const createKing = (material: THREE.Material) => {
    const body = createMesh(kingGeometry, material);
    const ring = createMesh(new THREE.TorusGeometry(0.16, 0.03, 12, 24), material);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.05;

    const crossV = createMesh(crossVertical, material);
    crossV.position.y = 1.25;

    const crossH = createMesh(crossHorizontal, material);
    crossH.position.y = 1.25;

    const sphere = createMesh(crownSphere, material);
    sphere.position.y = 1.15;

    const g = new THREE.Group();
    g.add(body, ring, crossV, crossH, sphere);
    return g;
};

export const createRook = (material: THREE.Material) => {
    const g = new THREE.Group();

    const base = createMesh(rookBase, material);
    base.position.y = 0.075;
    g.add(base);

    const body = createMesh(rookBody, material);
    body.position.y = 0.35;
    g.add(body);

    const crown = createMesh(rookCrown, material);
    crown.position.y = 0.7;
    g.add(crown);

    const step = (Math.PI * 2) / 4;
    for (let i = 0; i < 4; i += 1) {
        const merlon = createMesh(rookMerlon, material);
        merlon.position.set(Math.cos(step * i) * 0.23, 0.8, Math.sin(step * i) * 0.23);
        g.add(merlon);
    }
    return g;
};

export const createKnight = (material: THREE.Material) => {
    const g = new THREE.Group();

    const base = createMesh(knightBaseLower, material);
    base.position.y = 0.09;
    g.add(base);

    const pedestal = createMesh(knightBaseUpper, material);
    pedestal.position.y = 0.27;
    g.add(pedestal);

    const body = createMesh(knightBody, material);
    body.position.set(0, 0.55, 0);
    body.rotation.y = Math.PI / 5;
    g.add(body);

    const head = createMesh(knightHead, material);
    head.position.set(0.05, 0.83, 0.05);
    head.rotation.y = Math.PI / 4;
    g.add(head);

    const snout = createMesh(knightSnout, material);
    snout.position.set(0.16, 0.83, 0.1);
    snout.rotation.y = Math.PI / 6;
    g.add(snout);

    const ear1 = createMesh(knightEar, material);
    ear1.position.set(0.02, 1.02, 0.05);
    g.add(ear1);

    const ear2 = createMesh(knightEar, material);
    ear2.position.set(-0.08, 1.02, 0.02);
    g.add(ear2);

    return g;
};
