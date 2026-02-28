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
  captureDestinations: Set<string> = new Set(),
  inCheckKey: string | null = null,
  checkmateKey: string | null = null,
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
    const isCapture = captureDestinations.has(key);
    const dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24),
      new THREE.MeshBasicMaterial({ color: isCapture ? '#fda4af' : '#a7f3d0', transparent: true, opacity: 0.95 }),
    );
    dot.rotation.x = -Math.PI / 2;
    dot.position.copy(toWorld(key));
    const [r, c] = key.split(',').map((v) => Number(v));
    dot.userData.row = r;
    dot.userData.col = c;
    root.add(dot);
  });

  if (inCheckKey) {
    const checkRing = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.58, 32),
      new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    checkRing.rotation.x = -Math.PI / 2;
    checkRing.position.copy(toWorld(inCheckKey));
    root.add(checkRing);
  }

  if (checkmateKey) {
    const mateRing = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.62, 32),
      new THREE.MeshBasicMaterial({ color: '#fb7185', transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    );
    mateRing.rotation.x = -Math.PI / 2;
    mateRing.position.copy(toWorld(checkmateKey));
    root.add(mateRing);
  }
};
