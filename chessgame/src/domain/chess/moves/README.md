# Moves Module

## Overview
Concrete move implementations that adhere to the `Move` contract from the core module. These classes know how to validate, execute, and roll back specific move types.

## Module Layout
```
moves/
  SimpleMove.ts   Default move with capture validation and undo metadata
  index.ts        Barrel export for `@/domain/chess/moves`
```

## Design Notes
- `SimpleMove` demonstrates how to implement the `Move` interface; specialised moves (castling, en passant) should follow the same pattern.
- Move instances are intentionally small and immutable after construction, so they can be queued, replayed, or serialised.
- Higher-level services (factories, game state) compose moves rather than duplicating execution rules.

## Extension Points
- Add dedicated move types (e.g. `CastleMove`, `PromotionMove`) to encapsulate more complex logic.
- Provide helper builders that assemble move sequences for tutorials or automated play.
