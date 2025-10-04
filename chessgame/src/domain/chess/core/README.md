# Core

- `Team.ts`: team enum and helper to retrieve the opposite team.
- `Move.ts`: abstract contract that encapsulates move validation, execution, and rollback metadata.
- `Piece.ts`: base class for every piece, storing team, type, cloning, and move generation hooks.
- `Position.ts`: algebraic/coordinate helpers to reason about squares on the board.
- `Board.ts`: board state with lookups, movement, cloning, and occupancy helpers.
- `index.ts`: barrel file to import the core module with a single path.
