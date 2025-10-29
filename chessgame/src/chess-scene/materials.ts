import * as THREE from 'three';

// Cooler wood palette (fallback if textures are missing)
const WOOD_FALLBACK_LIGHT = '#e9dfcc';
const WOOD_FALLBACK_DARK = '#8a6e55';

export type SquareMaterials = {
    light: THREE.MeshPhysicalMaterial;
    dark: THREE.MeshPhysicalMaterial;
};

type WoodTexturePaths = {
    light: string;
    dark: string;
    lightNormal?: string;
    darkNormal?: string;
    lightRoughness?: string;
    darkRoughness?: string;
};

// Tries to load board textures (color + optional normal/roughness);
// if not found, keeps solid-color fallback.
export const createSquareMaterials = (
    paths: WoodTexturePaths = {
        light: '/textures/wood_oak_light.jpg',
        dark: '/textures/wood_walnut_dark.jpg',
        lightNormal: '/textures/wood_oak_light_normal.jpg',
        darkNormal: '/textures/wood_walnut_dark_normal.jpg',
        lightRoughness: '/textures/wood_oak_light_rough.jpg',
        darkRoughness: '/textures/wood_walnut_dark_rough.jpg',
    },
    options: { repeat?: number; anisotropy?: number } = {}
): SquareMaterials => {
    const repeat = options.repeat ?? 2;
    const anisotropy = options.anisotropy ?? 8;

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

    const applyMap = (p: string | undefined, target: THREE.MeshPhysicalMaterial, kind: 'color' | 'normal' | 'roughness') => {
        if (!p) return;
        const loader = new THREE.TextureLoader();
        loader.load(
            p,
            (tex) => {
                if (kind === 'color') {
                    tex.colorSpace = THREE.SRGBColorSpace;
                }
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(repeat, repeat);
                tex.anisotropy = Math.max(1, Math.min(16, anisotropy));
                if (kind === 'color') {
                    target.map = tex;
                    target.color.set('#ffffff');
                } else if (kind === 'normal') {
                    target.normalMap = tex;
                    target.normalScale = new THREE.Vector2(0.35, 0.35);
                } else if (kind === 'roughness') {
                    target.roughnessMap = tex;
                }
                target.needsUpdate = true;
            },
            undefined,
            () => { /* keep fallback gracefully */ }
        );
    };

    try {
        applyMap(paths.light, matLight, 'color');
        applyMap(paths.dark, matDark, 'color');
        applyMap(paths.lightNormal, matLight, 'normal');
        applyMap(paths.darkNormal, matDark, 'normal');
        applyMap(paths.lightRoughness, matLight, 'roughness');
        applyMap(paths.darkRoughness, matDark, 'roughness');
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
