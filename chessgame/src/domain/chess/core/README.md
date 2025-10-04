# Core Module

## Overview
Foundational chess domain abstractions: teams, positions, pieces, moves, and the board itself. These classes power higher-level modules such as move factories, rules, and UI adapters.

## Module Layout
```
core/
  Team.ts       Team enum plus helpers to flip between colours
  Move.ts       Contract that every move implementation must extend
  Piece.ts      Abstract chess piece with team, type, and move hooks
  Position.ts   Coordinate helpers and algebraic notation utilities
  Board.ts      Mutable board state with lookup and cloning helpers
  index.ts      Barrel export for convenient `@/domain/chess/core`
```

## Design Notes
- The `Move` contract exposes validation, execution, and rollback metadata to support undo and replay.
- `Piece` leaves move generation to subclasses, letting concrete pieces focus on their unique patterns.
- `Board` centralises occupancy checks, cloning, and capture bookkeeping so moves stay small.
- Modules above this layer should depend on these abstractions instead of instantiating state manually.

## Extension Points
- Add new board representations (for example bitboards) by mirroring the `Board` public API.
- Introduce additional helper methods in `Position` as new co-ordinate formats are required.
- Implement mixins or composition helpers for alternative movement rules while keeping `Piece` intact.
