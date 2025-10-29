// pieces.ts
import * as THREE from 'three';
import { BOARD_TOP_Y, SQUARE_SIZE, PIECES_SCALE, FIDE_HEIGHTS } from './constants';

// Convert a “cm” height to world units using the square size.
// Rule of thumb: visual king height ≈ 0.75 * SQUARE_SIZE (tweak if needed).
const heightFromSquare = (cm: number) => {
    const kingH = 0.75 * SQUARE_SIZE;
    return (cm / FIDE_HEIGHTS.king) * kingH;
};

// Base diameter ≈ 45% of piece height (between 40–50% looks good)
const baseDia = (h: number) => 0.45 * h;

// Staunton collar helper
const makeCollar = (r: number, y: number, t: number, mat: THREE.Material) => {
    const geo = new THREE.CylinderGeometry(r, r, t, 32);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y + t / 2;
    return m;
};

export const createMesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

export const positionPiece = (obj: THREE.Object3D, row: number, col: number) => {
    obj.position.set(
        (col - 3.5) * SQUARE_SIZE,
        BOARD_TOP_Y + 0.01,
        (row - 3.5) * SQUARE_SIZE,
    );
};

// -----------------------
// Lathe profiles
// -----------------------
const lathe = (points: THREE.Vector2[], segments = 64) =>
    new THREE.LatheGeometry(points, segments, 0, Math.PI * 2).toNonIndexed();

// Molded base profile
const baseProfile = (h: number, d: number) => {
    const r = d / 2;
    const lip = r * 0.08;
    const plinth = r * 0.18;

    const p: THREE.Vector2[] = [];
    p.push(new THREE.Vector2(0, 0));
    p.push(new THREE.Vector2(r, 0));
    p.push(new THREE.Vector2(r, h * 0.06));
    p.push(new THREE.Vector2(r - lip, h * 0.08));
    p.push(new THREE.Vector2(r - lip, h * 0.10));
    p.push(new THREE.Vector2(r - plinth, h * 0.14));
    p.push(new THREE.Vector2(r * 0.62, h * 0.18)); // start of shaft
    return p;
};

// Smooth conical shaft
const shaftProfile = (h: number, d: number) => {
    const r = d / 2;
    return [
        new THREE.Vector2(r * 0.62, h * 0.18),
        new THREE.Vector2(r * 0.55, h * 0.40),
        new THREE.Vector2(r * 0.50, h * 0.60),
        new THREE.Vector2(r * 0.45, h * 0.78),
    ];
};

// Compose base + shaft + custom top points
const bodyLathe = (h: number) => (topPoints: THREE.Vector2[]) => {
    const d = baseDia(h);
    const pts = [...baseProfile(h, d), ...shaftProfile(h, d), ...topPoints];
    return lathe(pts);
};

// -----------------------
// “Premium” material
// -----------------------
export const defaultMaterial = (color: number) =>
    new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.45,
        metalness: 0.0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.4,
        sheen: 0.2,
        envMapIntensity: 1.0,
    });

// -----------------------
// Pieces
// -----------------------
export const createPawn = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.pawn);
    const body = createMesh(
        bodyLathe(H)([
            // narrow neck + seat for the sphere
            new THREE.Vector2(baseDia(H) * 0.32, H * 0.90),
        ]),
        material
    );

    const collar = makeCollar(baseDia(H) * 0.36, H * 0.88, H * 0.03, material);

    const head = createMesh(new THREE.SphereGeometry(baseDia(H) * 0.22, 48, 32), material);
    head.position.y = H * 0.98;

    const g = new THREE.Group();
    g.add(body, collar, head);
    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};

export const createBishop = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.bishop);
    const d = baseDia(H);

    // Staunton bishop: slimmer neck and a miter cap
    const body = createMesh(
        bodyLathe(H)([
            new THREE.Vector2(d * 0.28, H * 0.86),           // slimmer neck than pawn
            new THREE.Vector2(d * 0.38, H * 0.90),           // flare
            new THREE.Vector2(d * 0.26, H * 0.96),           // taper towards the miter
        ]),
        material
    );

    const collar = makeCollar(d * 0.38, H * 0.84, H * 0.035, material);

    // Miter cap (slightly oval “head”)
    const head = createMesh(new THREE.SphereGeometry(d * 0.24, 48, 32), material);
    head.position.y = H * 0.98;

    // Diagonal slit (visual only – thin dark insert to read as a cut)
    // If you use CSG later, replace this with a boolean subtraction.
    const slitMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const slit = new THREE.Mesh(
        new THREE.BoxGeometry(d * 0.02, H * 0.28, d * 0.40),
        slitMat
    );
    slit.position.set(0, H * 0.98, d * 0.02);
    slit.rotation.z = Math.PI / 4;

    const g = new THREE.Group();
    g.add(body, collar, head, slit);
    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};

export const createQueen = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.queen);
    const body = createMesh(
        bodyLathe(H)([new THREE.Vector2(baseDia(H) * 0.34, H * 0.86)]),
        material
    );

    const collar = makeCollar(baseDia(H) * 0.42, H * 0.84, H * 0.035, material);

    const coronet = createMesh(new THREE.TorusGeometry(baseDia(H) * 0.36, baseDia(H) * 0.05, 16, 48), material);
    coronet.rotation.x = Math.PI / 2;
    coronet.position.y = H * 0.91;

    const pearls = 8;
    const g = new THREE.Group();
    g.add(body, collar, coronet);

    for (let i = 0; i < pearls; i++) {
        const pearl = createMesh(new THREE.SphereGeometry(baseDia(H) * 0.07, 24, 16), material);
        const ang = (i / pearls) * Math.PI * 2;
        pearl.position.set(Math.cos(ang) * baseDia(H) * 0.36, H * 0.98, Math.sin(ang) * baseDia(H) * 0.36);
        g.add(pearl);
    }
    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};

export const createKing = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.king);
    const body = createMesh(
        bodyLathe(H)([new THREE.Vector2(baseDia(H) * 0.34, H * 0.84)]),
        material
    );
    const collar = makeCollar(baseDia(H) * 0.42, H * 0.82, H * 0.035, material);

    const ring = createMesh(new THREE.TorusGeometry(baseDia(H) * 0.30, baseDia(H) * 0.045, 16, 48), material);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = H * 0.89;

    const sphere = createMesh(new THREE.SphereGeometry(baseDia(H) * 0.09, 24, 16), material);
    sphere.position.y = H * 0.95;

    const crossV = createMesh(new THREE.BoxGeometry(baseDia(H) * 0.06, H * 0.16, baseDia(H) * 0.06), material);
    crossV.position.y = H * 1.00;

    const crossH = createMesh(new THREE.BoxGeometry(H * 0.14, baseDia(H) * 0.06, baseDia(H) * 0.06), material);
    crossH.position.y = H * 1.00;

    const g = new THREE.Group();
    g.add(body, collar, ring, sphere, crossV, crossH);
    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};

// --- ROOK (narrower than base, capped radii) ---
export const createRook = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.rook);

    // keep the base as-is; the issue was the upper body being wider than base
    const d = baseDia(H);                 // diameter used for ratios
    const BASE_RADIUS = d * 0.5;          // actual base radius coming from baseProfile()
    const CAP = d * 0.48;                 // hard cap: any radius above base must be <= 0.48·d
    const EPS = H * 0.0015;

    // helper to clamp any radius to the cap (keeps everything slimmer than base)
    const rc = (x: number) => Math.min(x, CAP);

    // Body profile: molded base → small flare (<= base) → slim waist → gentle shoulder → neck
    const body = createMesh(
        lathe([
            ...baseProfile(H, d),                         // molded base (uses r = d/2 internally)
            new THREE.Vector2(rc(d * 0.46), H * 0.24),    // flare (<= 0.48d)
            new THREE.Vector2(rc(d * 0.40), H * 0.44),    // waist
            new THREE.Vector2(rc(d * 0.42), H * 0.62),    // approach neck
            new THREE.Vector2(rc(d * 0.44), H * 0.70),    // shoulder (still < base)
        ]),
        material
    );

    // Short neck drum (solid support for the crown)
    const neckH = H * 0.055;
    const neckR = rc(d * 0.46);
    const neck = createMesh(new THREE.CylinderGeometry(neckR, neckR, neckH, 64), material);
    neck.position.y = H * 0.70 + neckH / 2;

    // Staunton double rings (kept inside the cap)
    const ringT = H * 0.016;
    const ringR = rc(d * 0.47);
    const ring1 = createMesh(new THREE.TorusGeometry(ringR, ringT, 24, 64), material);
    const ring2 = createMesh(new THREE.TorusGeometry(ringR * 0.985, ringT, 24, 64), material);
    ring1.rotation.x = Math.PI / 2;
    ring2.rotation.x = Math.PI / 2;
    ring1.position.y = neck.position.y - neckH * 0.22;
    ring2.position.y = neck.position.y + neckH * 0.22;

    // Crown wall (thin, inside the cap)
    const crownH = H * 0.090;
    const wallR = rc(d * 0.47);
    const crown = createMesh(
        new THREE.CylinderGeometry(wallR, wallR, crownH, 64, 1, true),
        material
    );
    const neckTop = neck.position.y + neckH / 2;
    crown.position.y = neckTop + crownH / 2 - EPS;

    // Top lip + inner rim (to read as hollow without CSG)
    const crownTop = crown.position.y + crownH / 2;
    const topLip = createMesh(
        new THREE.CylinderGeometry(wallR * 0.99, wallR * 0.99, H * 0.008, 48),
        material
    );
    topLip.position.y = crownTop + H * 0.004;

    const innerRim = createMesh(
        new THREE.CylinderGeometry(wallR * 0.78, wallR * 0.78, H * 0.006, 32),
        material
    );
    innerRim.position.y = crownTop - H * 0.02;

    // Crenellations: slimmer and slightly inset
    const g = new THREE.Group();
    g.add(body, neck, ring1, ring2, crown, topLip, innerRim);

    const MERLONS = 8;
    const blockW = d * 0.13;
    const blockT = d * 0.09;
    const blockH = crownH * 0.72;
    const rBlocks = wallR * 0.98;

    for (let i = 0; i < MERLONS; i++) {
        const ang = (i / MERLONS) * Math.PI * 2;
        const merlon = createMesh(new THREE.BoxGeometry(blockW, blockH, blockT), material);
        merlon.position.set(Math.cos(ang) * rBlocks, crownTop - blockH / 2 + EPS, Math.sin(ang) * rBlocks);
        merlon.rotation.y = ang;

        // tiny cap to fake a bevel
        const cap = createMesh(new THREE.BoxGeometry(blockW * 0.92, H * 0.006, blockT * 0.92), material);
        cap.position.y = blockH * 0.5 + H * 0.003;
        merlon.add(cap);

        g.add(merlon);
    }

    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};





// --- KNIGHT (fuller head, snout, jaw, ears, eye, curved mane) ---
// --- KNIGHT (more realistic Staunton-style) ---
export const createKnight = (material: THREE.Material) => {
    const H = heightFromSquare(FIDE_HEIGHTS.knight);
    const d = baseDia(H);

    // Pedestal base
    const base = createMesh(
        lathe([...baseProfile(H, d), new THREE.Vector2(d * 0.60, H * 0.22)]),
        material
    );
    const collar = makeCollar(d * 0.46, H * 0.22, H * 0.035, material);

    // --- Neck (lathe cone-like curvature) ---
    const neckPts = [
        new THREE.Vector2(d * 0.40, 0),
        new THREE.Vector2(d * 0.36, H * 0.10),
        new THREE.Vector2(d * 0.28, H * 0.25),
        new THREE.Vector2(d * 0.22, H * 0.45),
        new THREE.Vector2(d * 0.20, H * 0.60),
    ];
    const neck = createMesh(lathe(neckPts, 32), material);
    neck.position.y = H * 0.20;

    // --- Head (assembled from spheres + taper) ---
    const headGroup = new THREE.Group();

    // Main skull
    const skull = createMesh(new THREE.SphereGeometry(d * 0.28, 32, 24), material);
    skull.scale.set(1.0, 1.4, 0.9);
    skull.position.set(0, H * 0.78, 0);
    headGroup.add(skull);

    // Snout (long stretched sphere)
    const snout = createMesh(new THREE.SphereGeometry(d * 0.20, 32, 24), material);
    snout.scale.set(1.2, 0.9, 0.8);
    snout.position.set(H * 0.16, H * 0.78, 0);
    headGroup.add(snout);

    // Lower jaw
    const jaw = createMesh(new THREE.CylinderGeometry(d * 0.12, d * 0.08, H * 0.20, 16), material);
    jaw.rotation.z = Math.PI / 2;
    jaw.position.set(H * 0.07, H * 0.70, 0);
    headGroup.add(jaw);

    // Ears
    const earGeo = new THREE.ConeGeometry(d * 0.07, d * 0.25, 10);
    const earL = createMesh(earGeo, material);
    const earR = createMesh(earGeo, material);
    earL.position.set(-d * 0.05, H * 0.95, d * 0.05);
    earR.position.set(-d * 0.10, H * 0.97, -d * 0.05);
    earL.rotation.x = Math.PI * 0.08;
    earR.rotation.x = Math.PI * 0.10;
    headGroup.add(earL, earR);

    // Eye (dark small sphere)
    const eye = new THREE.Mesh(
        new THREE.SphereGeometry(d * 0.045, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    eye.position.set(H * 0.05, H * 0.83, d * 0.13);
    headGroup.add(eye);

    // Mane (curved tube behind head)
    const manePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-d * 0.10, H * 0.55, -d * 0.12),
        new THREE.Vector3(-d * 0.12, H * 0.70, -d * 0.08),
        new THREE.Vector3(-d * 0.13, H * 0.88, -d * 0.02),
    ]);
    const maneGeo = new THREE.TubeGeometry(manePath, 12, d * 0.06, 8, false);
    const mane = createMesh(maneGeo, material);
    headGroup.add(mane);

    // Combine parts
    const g = new THREE.Group();
    g.add(base, collar, neck, headGroup);
    g.rotation.y = Math.PI / 10; // slight turn for natural profile
    g.scale.multiplyScalar(PIECES_SCALE);
    return g;
};
