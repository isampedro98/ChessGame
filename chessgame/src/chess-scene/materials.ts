import * as THREE from 'three';

export const createSquareMaterial = () => {
    const lightColor = new THREE.Color('#3a4253');
    const darkColor = new THREE.Color('#d7dde8');
    return { lightColor, darkColor };
};

export const createPieceMaterial = (team: 'WHITE' | 'BLACK') =>
    new THREE.MeshStandardMaterial({
        color: team === 'WHITE' ? '#f8f8f8' : '#2f3542',
        metalness: 0.3,
        roughness: 0.4,
    });

export const tableBaseMaterial = new THREE.MeshStandardMaterial({
    color: '#8b5a2b',
    roughness: 0.7,
    metalness: 0.05,
    emissive: '#2e1d0f',
    emissiveIntensity: 0.08,
});

export const tableBevelMaterial = new THREE.MeshStandardMaterial({
    color: '#a4723f',
    roughness: 0.5,
    metalness: 0.08,
});
