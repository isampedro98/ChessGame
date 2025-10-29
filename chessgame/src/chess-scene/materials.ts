import * as THREE from 'three';

// Cooler wood palette (fallback if textures are missing)
const WOOD_FALLBACK_LIGHT = '#e9dfcc';
const WOOD_FALLBACK_DARK = '#8a6e55';

export type SquareMaterials = {
    light: THREE.MeshPhysicalMaterial;
    dark: THREE.MeshPhysicalMaterial;
};

// Tries to load board textures; if not found, keeps solid-color fallback.
export const createSquareMaterials = (paths = {
    light: '/textures/wood_oak_light.jpg',
    dark: '/textures/wood_walnut_dark.jpg',
}): SquareMaterials => {
    const matLight = new THREE.MeshPhysicalMaterial({
        color: WOOD_FALLBACK_LIGHT,
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
    });
    const matDark = new THREE.MeshPhysicalMaterial({
        color: WOOD_FALLBACK_DARK,
        roughness: 0.5,
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
    });

    try {
        const loader = new THREE.TextureLoader();
        loader.load(
            paths.light,
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(2, 2);
                matLight.map = tex;
                matLight.color.set('#ffffff');
                matLight.needsUpdate = true;
            },
            undefined,
            () => { /* keep fallback */ }
        );
        loader.load(
            paths.dark,
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(2, 2);
                matDark.map = tex;
                matDark.color.set('#ffffff');
                matDark.needsUpdate = true;
            },
            undefined,
            () => { /* keep fallback */ }
        );
    } catch {
        // Running in a non-DOM environment or textures missing: leave fallbacks
    }

    return { light: matLight, dark: matDark };
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
