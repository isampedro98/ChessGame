# Changelog

All notable changes to this project will be documented in this file.

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
