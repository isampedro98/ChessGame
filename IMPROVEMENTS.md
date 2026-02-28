# Improvements (Prioritized)

Ordered by importance and ROI.

## Execution order (tackling one by one)

1. **Fixes** (§12) – duplicate game log + rematch box buttons  
2. **DevEx / CI** (§13) – add `npm test` to CI, optional coverage  
3. **Draw rules** (§4) – threefold repetition + 50-move rule  
4. **FEN** (§6) – import/export for state reproducibility, then PGN  
5. **Training UX** (§9) – undo in UI, highlight check/checkmate  
6. **Move list quality** (§10) – SAN (or LAN) in history  
7. **Promotion** (§7) – engine reject pawn/king, tests  
8. **Rules panel** (§8) – in-app short rules + link to official  
9. **Legal move edge cases** (§5) – pins, en passant, castling tests  
10. **3D performance** (§11) – piece instancing, raycast throttle  

---

## 1) ~~Perft + position suite~~ (done)
- ~~Validates move generation quickly and catches edge-case bugs.~~
- ~~A single day here saves weeks of manual debugging.~~

## 2) ~~Stalemate + insufficient material~~ (done)
- ~~Relatively straightforward.~~
- ~~Big correctness boost.~~

## 3) ~~Remove king-capture fallback~~ (done)
- ~~Either remove it entirely or keep it only as a debug mode.~~

## 4) Draw rules: threefold repetition + 50-move rule
- Core chess rules for correctness.
- Domain: position hash/FEN history + halfmove counter; check in `getResult()`.

## 5) Legal move edge cases
- Pins, discovered checks, double checks.
- En passant legality edge cases (only immediately after double-step, plus self-check).
- Castling strictness (rook/king moved, pass-through check).
- Add explicit tests for these cases.

## 6) FEN import/export (PGN later)
- FEN first for state reproducibility.
- PGN after that (as already planned in README).

## 7) Promotion UI + tests
- Simple modal for piece choice (already in place).
- Engine enforcement: cannot promote to pawn/king.
- Dedicated tests for invalid promotion.

## 8) Rules panel for beginners (in-app)
- Short, guided rules so noobs can learn while playing.
- Link to official rules for deeper reading.

## 9) Training UX
- Undo / backstep replay (critical for training) – expose `undoLastMove()` in UI.
- Highlight check/checkmate visually (2D board + optional 3D).

## 10) Move list quality
- SAN or LAN notation in history (replace or supplement "e2 -> e4" in HistoryPanel).

## 11) 3D performance
- Piece instancing / merge pass.
- Raycast throttling.

## 12) ~~Fixes~~ (done)
- ~~Fix history log after finishing match generates multiple game logs~~ – use ref to persist once per game; reset on new game/rematch.
- ~~Fix buttons in rematch box~~ – `type="button"`, focus ring, `py-2`, `flex-wrap`, `z-10` on container.

## 13) DevEx / CI
- ~~Add `npm test` to CI~~ – step added in `.github/workflows/nextjs.yml`.
- Optional: coverage gating, pre-commit lint/format.

## 14) Erase history
- Allow user to erase matches history
