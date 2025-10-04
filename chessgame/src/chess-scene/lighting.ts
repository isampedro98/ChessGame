import * as THREE from 'three';

export const createLights = () => {
  const ambient = new THREE.AmbientLight('#dfe7ff', 0.4);
  const hemi = new THREE.HemisphereLight('#f4f7ff', '#1a1f2b', 0.55);

  const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
  dirLight.position.set(6, 12, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;

  const warm = new THREE.SpotLight('#f9d8a2', 0.5, 20, Math.PI / 6, 0.4, 1);
  warm.position.set(-7, 8, -5);
  warm.target.position.set(0, 0, 0);
  warm.castShadow = true;

  return { ambient, hemi, dirLight, warmLight: warm };
};
