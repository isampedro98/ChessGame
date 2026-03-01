# Changelog

All notable changes to this project will be documented in this file.

## [0.6.2] - 2026-03-01
### Changes
- Move history now renders SAN notation (human-readable) instead of raw coordinate descriptions.
- Added shared SAN generation in domain via `gameToSANMoves` and reused it in both History and PGN export paths.
- Added dedicated SAN/PGN tests (`src/domain/chess/__tests__/pgn.test.ts`) and LAN-like fallback notation when replay reconstruction fails.
- Fixed Domain board coordinate alignment so rank labels (1-8) map correctly to board rows.
- Updated max-moves selector UX: explicit `50 (professional max)`, reordered options, and removed `100`.
- Expanded project docs: strategic README framing, Architectural Principles, Contributing guide, and roadmap specs for local rating, bot levels, and multiplayer paths.

### Done
- Improvement #10 completed (Move list quality with SAN history notation).
- Domain board coordinate labels now stay visually aligned with the grid.

### Ongoing
- 3D performance pass (piece instancing / raycast throttling).

### TODO
- Engine hints while playing (candidate moves + lightweight decision tree).

## [0.6.1] - 2026-02-28
### Changes
- Refined UI layout by splitting `Game Status` and `Game Actions` into separate panels.
- Moved `Rules for Beginners` to the left column above Stats for better board readability.
- Added a dedicated `GameStatusPanel` above the Three.js scene (turn, moves, max-moves, state chip).
- Grouped game actions logically (Flow / Training / Data).
- Updated CI cache key to include `package.json` so app-version badge updates are not stale after release bumps.

### Done
- Training UX layout restructuring is now clearer and easier to scan.
- Beginner rules are now placed where they support board reading and learning flow.

### Ongoing
- Move list quality upgrades (SAN/LAN clarity in History panel).

### TODO
- Engine hints while playing (candidate moves + lightweight decision tree).

## [0.6.0] - 2026-02-28
### Changes
- Added Training UX backstep in UI with `Undo`, wired to `undoLastMove()`.
- In bot-training mode, undo can step back through bot reply and player move to restore trainee turn.
- Added check/checkmate visual highlights on 2D board and 3D scene markers.
- Added collapsible controls for Stats and Move History panels.

### Done
- Improvement #9 completed (Training UX).

### Ongoing
- Move list quality upgrades (SAN/LAN clarity in History panel).

### TODO
- Engine hints while playing (candidate moves + lightweight decision tree).

## [0.5.5] - 2026-02-28
### Changes
- Added a dedicated legal-edge-case test suite covering pins, double-check, en passant timing/self-check, and castling after king/rook movement.
- Hardened promotion rules: engine now rejects promotion to pawn/king, with explicit invalid-promotion tests.
- Added a collapsible beginner Rules panel with practical guidance and a direct FIDE rules link.
- Made Stats and Move History panels collapsible.
- Expanded i18n entries for new panel/toggle labels.

### Done
- Improvement #5 completed (legal move edge cases).
- Improvement #7 completed (promotion enforcement + tests).
- Improvement #8 completed (rules panel for beginners).

### Ongoing
- Training UX improvements (undo/backstep and visual check/checkmate cues).

### TODO
- Add lightweight engine hints (candidate moves + mini decision tree guidance).

## [0.5.4] - 2026-02-28
### Changes
- Game export/import: new schema version 2 with FEN per move (position after each move).
- Import still accepts legacy JSON (schemaVersion < 2): board is computed by replaying moves; FEN in v2 is for reproducibility/validation.
- PGN for scoreboard: each finished game stores PGN; Stats panel shows "Copy PGN" and "Show PGN" per game.
- Domain: `Game.toFEN()`, `Game.getHalfMoveClock()`, `Game.getFullMoveNumber()`, `Game.isKingInCheck()`; new `pgn.ts` (moveToSAN, gameToPGN, buildMoveForBoard).

### Done
- FEN (Forsyth-Edwards Notation) for current position and per-move in export.
- PGN (Standard Algebraic Notation) generated and stored per game; visible and copyable in Stats.

### Ongoing
- Optional: load game from FEN (currently import replays moves only).

## [0.5.3] - 2026-02-28
### Changes
- Fixed duplicate match-history entries when a game ends by persisting results only once per game.
- Improved end-of-game rematch prompt buttons (`type="button"`, focus ring, spacing, wrap, z-index).
- Added `npm run test` to CI workflow (`.github/workflows/nextjs.yml`).

### Done
- End-of-game summaries no longer duplicate in saved stats/history.
- Rematch prompt actions are more robust and accessible.
- CI now validates lint, tests, and build.

### Ongoing
- Expand draw rules (threefold repetition, 50-move rule).

### TODO
- Add option to clear persisted match history from the UI.

## [0.5.2] - 2026-01-29
### Changes
- Removed king-capture fallback from game result detection.

### Done
- Missing-king scenarios no longer award a winner.

### Ongoing
- Expand draw rules (threefold repetition, 50-move rule).

### TODO
- Promote perft suite into CI gating once stabilized.

## [0.5.1] - 2026-01-29
### Changes
- Added stalemate and insufficient-material draws.

### Done
- Draw detection now returns a proper game result (win/loss/draw).

### Ongoing
- Expand draw rules (threefold repetition, 50-move rule).

### TODO
- Remove king-capture fallback or restrict it to debug mode.

## [0.5.0] - 2026-01-29
### Changes
- Added perft position suite to validate move generation.

### Done
- Perft baselines for starting position plus castling/en-passant cases.

### Ongoing
- Expand perft coverage with additional positions and depths.

### TODO
- Promote perft suite into CI gating once stabilized.

## [0.4.0] - 2026-01-27
### Changes
- Train vs AI uses a deterministic state-machine evaluator (no generative AI).
- Bot now plays its own moves and provides move feedback for both sides.
- Added promotion choice UI and synced 3D updates for promoted pieces.
- Added camera presets (Player/Studio) plus a free-orbit mode.
- Added unit tests per piece (pawn, knight, bishop, rook, queen, king).

### Done
- Training feedback surfaced in the info panel.
- Bot move selection based on heuristic scoring.
- Promotion selection and 3D promotion sync.
- Camera preset toggle in the 3D scene panel.
- Piece-level unit test coverage.

### Ongoing
- Strength tuning and reason coverage improvements.

### TODO
- Training presets (aggressive, solid, endgame).

## [0.2.0] - 2026-01-26
### Changes
- Added special moves (castling, en passant, promotion) and enforced self-check rejection in `Game.executeMove`.
- Extended move export/import for special moves.
- Added 3D piece tweens synced to move updates and instanced board squares for fewer draw calls.
- Added Vitest runner with domain special-move tests.

### Done
- Special-move legality for standard chess.
- 3D move tweens synced with domain history.
- Instanced board squares (2 meshes).

### Ongoing
- Piece-level instancing/merge pass (pawns and repeated meshes).

### TODO
- FEN/PGN import/export.
- Bot evaluation upgrades (minimax).
- UI settings panel and animation speed control.

## [0.1.0] - 2025-10-20
### Changes
- Initial public version with layered architecture (domain / chess-scene / app).
- Static export + GitHub Pages pipeline.
- Basic engine rules + UI/3D sync + stats/export/import.
