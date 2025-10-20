import * as THREE from 'three';
import { SQUARE_SIZE, BOARD_THICKNESS } from './constants';
import { createSquareMaterial } from './materials';

export const createBoard = () => {
    const group = new THREE.Group();
    const cellGeometry = new THREE.BoxGeometry(SQUARE_SIZE, BOARD_THICKNESS, SQUARE_SIZE);
    const { lightColor, darkColor } = createSquareMaterial();

    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const isDark = (row + col) % 2 === 1;
            const material = new THREE.MeshStandardMaterial({
                color: isDark ? darkColor : lightColor,
                roughness: 0.4,
                metalness: 0.1,
            });
            const cell = new THREE.Mesh(cellGeometry, material);
            cell.position.set((col - 3.5) * SQUARE_SIZE, 0, (row - 3.5) * SQUARE_SIZE);
            cell.castShadow = true;
            cell.receiveShadow = true;
            group.add(cell);
        }
    }

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 0.2, 8.6),
        new THREE.MeshStandardMaterial({ color: '#2a303d', roughness: 0.6, metalness: 0.05 }),
    );
    frame.position.y = -0.1;
    frame.receiveShadow = true;
    group.add(frame);

    return group;
};
