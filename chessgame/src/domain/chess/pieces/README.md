# Pieces Module

## Overview
Concrete chess pieces that extend the core `Piece` base class. Each class encapsulates its move generation and cloning behaviour, keeping rule logic close to the piece it applies to.

## Module Layout
```
pieces/
  SlidingPiece.ts   Shared helpers for linear movers (rook, bishop, queen)
  King.ts           Generates king moves (castling TODO)
  Queen.ts          Queen-specific move generation built on `SlidingPiece`
  Rook.ts           Orthogonal sliding moves
  Bishop.ts         Diagonal sliding moves
  Knight.ts         L-shaped jumps that ignore occupancy between squares
  Pawn.ts           Forward pushes and diagonal captures (promotion/en passant TODO)
  index.ts          Barrel export for `@/domain/chess/pieces`
```

## Design Notes
- All pieces lean on utilities from the core module (`Position`, `Board`, `Move`).
- The shared `SlidingPiece` removes duplication across rook, bishop, and queen paths.
- Keep promotion or special-move logic local to `Pawn` so higher layers can iterate over legal moves once implemented.

## Extension Points
- Introduce variants (for example fairy pieces) by subclassing `Piece` and reusing helpers here.
- Add configuration hooks (speed, animation metadata) without changing the existing API surface.
