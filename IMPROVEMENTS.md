# Improvements (Prioritized)

Ordered by importance and ROI.

## 1) ~~Perft + position suite~~ (done)
- ~~Validates move generation quickly and catches edge-case bugs.~~
- ~~A single day here saves weeks of manual debugging.~~

## 2) Stalemate + insufficient material
- Relatively straightforward.
- Big correctness boost.

## 3) Remove king-capture fallback
- Either remove it entirely or keep it only as a debug mode.

## 4) Draw rules: threefold repetition + 50-move rule
- Core chess rules for correctness.

## 5) Legal move edge cases
- Pins, discovered checks, double checks.
- En passant legality edge cases (only immediately after double-step, plus self-check).
- Castling strictness (rook/king moved, pass-through check).

## 6) FEN import/export (PGN later)
- FEN first for state reproducibility.
- PGN after that (as already planned in README).

## 7) Promotion UI + tests
- Simple modal for piece choice.
- Engine enforcement: cannot promote to pawn/king.
- Dedicated tests.

## 8) Rules panel for beginners (in-app)
- Short, guided rules so noobs can learn while playing.
- Link to official rules for deeper reading.

## 9) Training UX
- Undo / backstep replay (critical for training).
- Highlight check/checkmate visually.

## 10) Move list quality
- SAN or LAN notation in history.

## 11) 3D performance
- Piece instancing / merge pass.
- Raycast throttling.

## 12) DevEx / CI
- Add `npm test` to CI with coverage gating.
- Optional pre-commit lint/format.
