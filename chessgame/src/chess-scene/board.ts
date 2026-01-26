import * as THREE from 'three';
import { SQUARE_SIZE, BOARD_THICKNESS } from './constants';
import { createSquareMaterials } from './materials';

export const createBoard = () => {
    const group = new THREE.Group();
    const cellGeometry = new THREE.BoxGeometry(SQUARE_SIZE, BOARD_THICKNESS, SQUARE_SIZE);
    const { light, dark } = createSquareMaterials();

    const darkSquares = new THREE.InstancedMesh(cellGeometry, dark, 32);
    const lightSquares = new THREE.InstancedMesh(cellGeometry, light, 32);
    darkSquares.castShadow = true;
    darkSquares.receiveShadow = true;
    lightSquares.castShadow = true;
    lightSquares.receiveShadow = true;

    const darkMap: Array<{ row: number; col: number }> = [];
    const lightMap: Array<{ row: number; col: number }> = [];
    darkSquares.userData.instanceToCell = darkMap;
    lightSquares.userData.instanceToCell = lightMap;

    let darkIndex = 0;
    let lightIndex = 0;
    const temp = new THREE.Object3D();

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const isDark = (row + col) % 2 === 1;
            temp.position.set((col - 3.5) * SQUARE_SIZE, 0, (row - 3.5) * SQUARE_SIZE);
            temp.updateMatrix();
            if (isDark) {
                darkSquares.setMatrixAt(darkIndex, temp.matrix);
                darkMap[darkIndex] = { row, col };
                darkIndex += 1;
            } else {
                lightSquares.setMatrixAt(lightIndex, temp.matrix);
                lightMap[lightIndex] = { row, col };
                lightIndex += 1;
            }
        }
    }

    darkSquares.instanceMatrix.needsUpdate = true;
    lightSquares.instanceMatrix.needsUpdate = true;

    group.add(darkSquares, lightSquares);

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 0.2, 8.6),
        new THREE.MeshStandardMaterial({ color: '#6b4f2a', roughness: 0.65, metalness: 0.05 }),
    );
    frame.position.y = -0.1;
    frame.receiveShadow = true;
    group.add(frame);

    return group;
};
