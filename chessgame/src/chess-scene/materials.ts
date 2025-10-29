import * as THREE from 'three';

// Cooler wood palette (less orange)
export const createSquareMaterial = () => {
    const lightColor = new THREE.Color('#e9dfcc'); // light beech/maple (cooler)
    const darkColor = new THREE.Color('#8a6e55');  // cooler walnut/brown
    return { lightColor, darkColor };
};

// Painted-ebony and boxwood-like pieces with subtle clearcoat
export const createPieceMaterial = (team: 'WHITE' | 'BLACK') =>
    new THREE.MeshPhysicalMaterial({
        color: team === 'WHITE' ? '#e8e3d6' : '#1b1b1b',
        metalness: 0.0,
        roughness: team === 'WHITE' ? 0.60 : 0.45,
        clearcoat: team === 'WHITE' ? 0.10 : 0.25,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.12,
    });

// Warm wood table
export const tableBaseMaterial = new THREE.MeshStandardMaterial({
    color: '#7b5a40',
    roughness: 0.78,
    metalness: 0.04,
    emissive: '#2a1b10',
    emissiveIntensity: 0.04,
});

export const tableBevelMaterial = new THREE.MeshStandardMaterial({
    color: '#9a7a5b',
    roughness: 0.62,
    metalness: 0.04,
});
