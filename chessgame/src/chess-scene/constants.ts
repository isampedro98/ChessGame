import * as THREE from 'three';

export const SQUARE_SIZE = 1;
export const PIECE_HEIGHT = 0.8;

export const BOARD_THICKNESS = 0.05;
export const BOARD_TOP_Y = BOARD_THICKNESS / 2;

export const BACKGROUND_COLOR = new THREE.Color("#161923");

// -----------------------
// Proportion helpers
// -----------------------

export const PIECES_SCALE = 2.25;

// FIDE-ish relative heights (cm references only for ratios)
export const FIDE_HEIGHTS = {
    king: 9.5,
    queen: 8.5,
    bishop: 7.0,
    knight: 6.0,
    rook: 5.5,
    pawn: 5.0,
};
