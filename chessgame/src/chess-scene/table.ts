import * as THREE from 'three';
import { tableBaseMaterial, tableBevelMaterial } from './materials';

export const createTable = () => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 10), tableBaseMaterial);
    base.position.y = -0.25;

    const bevel = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.05, 10.4), tableBevelMaterial);
    bevel.position.y = -0.35;

    const table = new THREE.Group();
    table.add(base, bevel);
    table.traverse((o) => { if (o instanceof THREE.Mesh) o.receiveShadow = true; });
    return table;
};
