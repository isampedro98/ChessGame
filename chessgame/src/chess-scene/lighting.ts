import * as THREE from 'three';

export const createLights = () => {
  const ambient = new THREE.AmbientLight('#e8ecf5', 0.18);
  const hemi = new THREE.HemisphereLight('#e9eef7', '#1a1f2b', 0.25);

  const dirLight = new THREE.DirectionalLight('#ffffff', 0.78);
  dirLight.position.set(6, 12, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;

  const warm = new THREE.SpotLight('#f3d4a2', 0.20, 20, Math.PI / 6, 0.5, 1);
  warm.position.set(-7, 8, -5);
  warm.target.position.set(0, 0, 0);
  warm.castShadow = true;

  return { ambient, hemi, dirLight, warmLight: warm };
};
