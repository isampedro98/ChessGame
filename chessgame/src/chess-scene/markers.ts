import * as THREE from 'three';
import { BOARD_TOP_Y, SQUARE_SIZE } from './constants';

const toWorld = (key: string): THREE.Vector3 => {
  const [rowStr, colStr] = key.split(',');
  const row = Number(rowStr);
  const col = Number(colStr);
  return new THREE.Vector3(
    (col - 3.5) * SQUARE_SIZE,
    BOARD_TOP_Y + 0.02,
    (row - 3.5) * SQUARE_SIZE,
  );
};

export const updateMarkers = (
  root: THREE.Group,
  selectedKey: string | null,
  destinations: Set<string>,
): void => {
  while (root.children.length > 0) {
    const c = root.children.pop();
    if (c) root.remove(c);
  }

  if (selectedKey) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.46, 32),
      new THREE.MeshBasicMaterial({ color: '#34d399', transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(toWorld(selectedKey));
    const [r, c] = selectedKey.split(',').map((v) => Number(v));
    ring.userData.row = r;
    ring.userData.col = c;
    root.add(ring);
  }

  destinations.forEach((key) => {
    const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24),
      new THREE.MeshBasicMaterial({ color: '#a7f3d0', transparent: true, opacity: 0.9 }),
    );
    dot.rotation.x = -Math.PI / 2;
    dot.position.copy(toWorld(key));
    const [r, c] = key.split(',').map((v) => Number(v));
    dot.userData.row = r;
    dot.userData.col = c;
    root.add(dot);
  });
};

