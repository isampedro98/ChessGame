# Chess Scene (Three.js)

## Overview
This package contains the Three.js building blocks used to render the 3D chess scene inside the Next.js app. Each file focuses on a single responsibility so the scene can be composed, extended, and tested in isolation.

## Module Layout
```
chess-scene/
  board.ts        Board mesh with alternating squares and trim
  constants.ts    Shared numeric constants, colours, and z-levels
  geometries.ts   Reusable BufferGeometry builders for every piece
  lighting.ts     Ambient, hemisphere, directional, and spot lights
  materials.ts    Materials for board, table, and team-specific pieces
  pieces.ts       Piece factories that combine geometries and materials
  scene.ts        Scene, camera, and renderer helpers
  table.ts        Wooden table that holds the board
  index.ts        Barrel exports so consumers can import from '@/chess-scene'
```

## Usage Example
```tsx
import { useEffect, useRef } from 'react';
import {
  createRenderer,
  createSceneAndCamera,
  createLights,
  createTable,
  createBoard,
  createPieceMaterial,
  createPawn,
  createRook,
  createKnight,
  createBishop,
  createQueen,
  createKing,
  positionPiece,
} from '@/chess-scene';
import { PieceType } from '@/domain/chess';

export function ChessScene({ initialPieces }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const renderer = createRenderer(canvasRef.current);
    const { scene, camera } = createSceneAndCamera(canvasRef.current);

    const { ambient, hemi, dirLight, warmLight } = createLights();
    scene.add(ambient, hemi, dirLight, warmLight, warmLight.target);

    scene.add(createTable(), createBoard());

    const materials = {
      WHITE: createPieceMaterial('WHITE'),
      BLACK: createPieceMaterial('BLACK'),
    };

    initialPieces.forEach(({ id, type, team, position }) => {
      const factory = {
        [PieceType.Pawn]: createPawn,
        [PieceType.Rook]: createRook,
        [PieceType.Knight]: createKnight,
        [PieceType.Bishop]: createBishop,
        [PieceType.Queen]: createQueen,
        [PieceType.King]: createKing,
      }[type];

      const mesh = factory(materials[team]);
      positionPiece(mesh, position.row, position.column);
      mesh.name = id;
      scene.add(mesh);
    });

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => renderer.dispose();
  }, [initialPieces]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
```

## Core Concepts
- Layered helpers keep rendering concerns (geometry, materials, lighting) independent.
- All geometry builders are pure functions, which makes cloning and testing easier.
- TypeScript types document the public surface and ensure call sites stay in sync.
- Consumers assemble the scene explicitly, so features like custom cameras or themes can be added without touching internals.

## Roadmap
- Add OrbitControls support for interactive camera movement.
- Add raycasting helpers to pick pieces by clicking the board.
- Animate piece movement using tweens when a move is played.
- Add coordinate labels around the board edges for debugging and UX.
