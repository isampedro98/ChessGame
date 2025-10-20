import * as THREE from 'three';
import { SQUARE_SIZE } from './constants';

export const deriveBoardCoordsFromObject = (obj: THREE.Object3D): { row: number; col: number } => {
  // Walk up to find explicit userData indices
  let current: THREE.Object3D | null = obj;
  for (let i = 0; i < 5 && current; i += 1) {
    const ud = current.userData || {};
    if (typeof ud.row === 'number' && typeof ud.col === 'number') {
      return { row: ud.row, col: ud.col };
    }
    current = current.parent;
  }

  // Fallback: world position snap
  const world = new THREE.Vector3();
  obj.getWorldPosition(world);
  const col = Math.round(world.x / SQUARE_SIZE + 3.5);
  const row = Math.round(world.z / SQUARE_SIZE + 3.5);
  return { row, col };
};

