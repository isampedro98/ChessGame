# Improvements (Prioritized)

Ordered by importance and ROI.

## Execution order (tackling one by one)

1. ~~**Fixes** (Sec 12) - duplicate game log + rematch box buttons~~
2. ~~**DevEx / CI** (Sec 13) - add `npm test` to CI, optional coverage~~
3. ~~**Draw rules** (Sec 4) - threefold repetition + 50-move rule~~
4. ~~**FEN** (Sec 6) - import/export for state reproducibility, then PGN~~
5. ~~**Training UX** (Sec 9) - undo in UI, highlight check/checkmate~~
6. **Move list quality** (Sec 10) - SAN (or LAN) in history
7. ~~**Promotion** (Sec 7) - engine reject pawn/king, tests~~
8. ~~**Rules panel** (Sec 8) - in-app short rules + link to official~~
9. ~~**Legal move edge cases** (Sec 5) - pins, en passant, castling tests~~
10. **3D performance** (Sec 11) - piece instancing, raycast throttle
11. **Engine hints** (Sec 17) - basic move suggestions and mini decision tree guidance

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
- ~~FEN first for state reproducibility~~ - Game export v2 includes `fen` per move; `Game.toFEN()` in domain.
- ~~PGN for scoreboard~~ - `gameToPGN()`, SAN in `pgn.ts`; each finished game stores PGN; Stats panel: Copy PGN / Show PGN.
- Import: legacy (schemaVersion < 2) still accepted; replay from moves only (FEN in v2 for documentation/validation).

## 7) ~~Promotion UI + tests~~ (done)
- ~~Simple modal for piece choice is in place.~~
- ~~Engine enforces valid promotion targets only (queen/rook/bishop/knight).~~
- ~~Dedicated tests added for invalid promotion to pawn/king.~~

## 8) ~~Rules panel for beginners (in-app)~~ (done)
- ~~Added a collapsible in-app panel with concise beginner guidance.~~
- ~~Included practical checkpoints (objective, legality, opening, filtering moves, endgame habits).~~
- ~~Added direct link to official FIDE rules for deeper reading.~~

## 9) ~~Training UX~~ (done)
- ~~Added undo/backstep in UI (`Undo` action wired to `undoLastMove()`).~~
- ~~In bot-training mode, undo can step back through bot response and player move to restore the trainee turn.~~
- ~~Added check/checkmate visual highlighting in 2D board and 3D scene markers.~~

## 10) Move list quality
- SAN or LAN notation in history (replace or supplement "e2 -> e4" in HistoryPanel).

## 11) 3D performance
- Piece instancing / merge pass.
- Raycast throttling.

## 12) ~~Fixes~~ (done)
- ~~Fix history log after finishing match generates multiple game logs~~ - use ref to persist once per game; reset on new game/rematch.
- ~~Fix buttons in rematch box~~ - `type="button"`, focus ring, `py-2`, `flex-wrap`, `z-10` on container.

## 13) DevEx / CI
- ~~Add `npm test` to CI~~ - step added in `.github/workflows/nextjs.yml`.
- Optional: coverage gating, pre-commit lint/format.

## 14) Erase history
- Allow user to erase matches history.

## 15) Add changelog to frontend
- Add hiddable changelog section in frontend.

## 16) Choose AI side
- Choose side if against AI (Training mode ON).

## 17) Engine hints while playing
- Suggest 2-3 candidate moves each turn with a short reason for each.
- Show a basic decision tree (if opponent does X, your solid replies are A/B).
- Keep it lightweight (heuristics first, no heavy search required at first version).
