# Factories Module

## Overview
Factory helpers that stitch together core pieces, moves, and board state into ready-to-use game instances. Use these utilities to bootstrap gameplay without wiring the dependencies manually.

## Module Layout
```
factories/
  createStandardGame.ts   Builds a fresh `Game` with the standard chess setup
  index.ts                Barrel export for `@/domain/chess/factories`
```

## Design Notes
- Factories depend on the core and pieces modules to instantiate a consistent game state.
- Keeping construction logic here avoids scattering setup code across UI or service layers.

## Extension Points
- Add alternative factories for puzzle positions, tutorials, or variant rule sets.
- Expose async factories if future setups require loading assets or persisted state.
