import * as THREE from 'three';
import {
  pawnGeometry,
  bishopGeometry,
  queenGeometry,
  kingGeometry,
  rookBody,
} from '@/chess-scene/geometries';
import { createLights } from '@/chess-scene/lighting';

describe('geometry builders', () => {
  test('lathe geometries are defined and have vertices', () => {
    [pawnGeometry, bishopGeometry, queenGeometry, kingGeometry].forEach((g) => {
      expect(g).toBeInstanceOf(THREE.LatheGeometry);
      expect((g as THREE.BufferGeometry).attributes.position.count).toBeGreaterThan(0);
    });
  });

  test('rook body is a cylinder geometry', () => {
    expect(rookBody).toBeInstanceOf(THREE.CylinderGeometry);
    expect((rookBody as THREE.CylinderGeometry).parameters.height).toBeGreaterThan(0.5);
  });
});

describe('lighting builder', () => {
  test('returns expected light set', () => {
    const { ambient, hemi, dirLight, warmLight } = createLights();
    expect(ambient).toBeInstanceOf(THREE.AmbientLight);
    expect(hemi).toBeInstanceOf(THREE.HemisphereLight);
    expect(dirLight).toBeInstanceOf(THREE.DirectionalLight);
    expect(warmLight).toBeInstanceOf(THREE.SpotLight);
  });
});

