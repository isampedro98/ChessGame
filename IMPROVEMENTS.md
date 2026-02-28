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
9. ~~**Legal move edge cases** (�5) - pins, en passant, castling tests~~  
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

## 4) ~~Draw rules: threefold repetition + 50-move rule~~ (done)
- ~~Core chess rules for correctness.~~
- ~~Domain: position key (board + turn + castling + ep), `positionKeys[]` for threefold; `halfMovesWithoutCaptureOrPawn` for 50-move; both checked in `getResult()`.~~
- ~~Max moves select: added option "50 (professional max)" in InfoPanel.~~

## 5) ~~Legal move edge cases~~ (done)
- ~~Pins, discovered checks, and double checks are covered by explicit tests.~~
- ~~En passant edge cases are covered: immediate-only window and self-check rejection.~~
- ~~Castling strictness is covered: king/rook moved and pass-through attack constraints.~~
- ~~Added explicit test suite in `legalMoveEdgeCases.test.ts`.~~

## 6) ~~FEN import/export (PGN later)~~ (done)
- ~~FEN first for state reproducibility~~ – Game export v2 includes `fen` per move; `Game.toFEN()` in domain.
- ~~PGN for scoreboard~~ – `gameToPGN()`, SAN in `pgn.ts`; each finished game stores PGN; Stats panel: Copy PGN / Show PGN.
- Import: legacy (schemaVersion &lt; 2) still accepted; replay from moves only (FEN in v2 for documentation/validation).

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

## 15) Add changelog to frontend
- Add hiddable changelog section in frontend

## 15) Choose AI side
- Choose side if agains AI (Training mode ON)
