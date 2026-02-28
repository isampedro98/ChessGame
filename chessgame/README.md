# ChessGame

Next.js application that pairs a TypeScript chess engine with a fully rendered Three.js board. The repository contains the domain logic, a modular 3D scene, and the UI layer that ties everything together.

## Demo
https://isampedro98.github.io/ChessGame/

## Tech Stack
- Next.js 15 (App Router, `output: 'export'` for static hosting)
- React 19
- Strict TypeScript (`strict: true`, path aliases `@/*`)
- ESLint (flat config) with `next/core-web-vitals` + `next/typescript`
- Tailwind CSS v4 via `@tailwindcss/postcss`
- Three.js for the 3D scene

## Requirements
- Node.js 20+
- npm 10+

Install dependencies:
```bash
npm install
```

## Development
```bash
npm run dev
```
Visit http://localhost:3000 to explore the UI, play through moves, and see the synchronized 3D scene.

## Useful Scripts
```bash
npm run lint    # Run ESLint using the project configuration
npm run test    # Run Vitest suites
```

## Build & Static Export
- The project is configured for static export (`next.config.ts` sets `output: 'export'`).
- `npm run build` produces the site in `out/`, ready for any static host.
- When deployed to GitHub Pages, `basePath` is set automatically from `GITHUB_REPOSITORY`.

## Project Layout
```
chessgame/
  src/
    app/
      chess-ui/      Chess-specific view helpers (documented in README.md)
      components/    React components for board, panels, and scene wrapper
      hooks/         Stateful hooks that orchestrate the UI
      i18n/          Translation provider and locale dictionaries
    chess-scene/     Three.js scene builders for board, table, lights, pieces
    domain/
      chess/
        core/        Engine primitives: board, pieces, positions, moves
        pieces/      Concrete piece implementations
        moves/       Move classes built on the core contract
        factories/   Game bootstrapping helpers
```
Each folder contains its own README with additional context and extension points.

## Domain Model (Source of Truth)
- `Game` owns the authoritative state: `Board` + side to move + move history.
- `Board` stores `Piece` instances by `Position`; pieces carry id, team, type, and position.
- `Move` defines `from`/`to` plus `validate`, `execute`, and `revert`; history records the move and resolution (captures).
- UI (`app/`) and 3D scene (`chess-scene/`) are pure projections of `Game` state. No hidden state outside the domain.

## Visible Architecture
```text
Domain -> Engine -> UI

domain/chess   -> rules and state transitions
app/hooks      -> orchestration layer
app/components -> user-facing controls/panels
chess-scene    -> 3D projection of current game state
```

- Domain mutations are centralized (`Game.executeMove`, `Game.undoLastMove`).
- Rules stay in the engine, UI stays declarative.
- Domain and scene layers are reinforced by test suites.

## Server Actions Fit
- This project uses static export (`output: 'export'`) for GitHub Pages.
- In this deployment model, server actions are not the natural default for chess-state mutations.
- Current approach: deterministic client-side domain mutations.
- Server actions/API routes would make sense only after moving to a server-backed runtime (accounts, multiplayer, persistent storage).

## Rules Coverage (Current)
- Piece-legal movement for all standard pieces.
- Self-check moves are filtered during move generation (UI and bot) and rejected in `Game.executeMove`.
- Special moves are implemented in `Game` (castling, en passant, promotion). Promotion defaults to a queen.
- Winner detection: checkmate, stalemate, insufficient material, threefold repetition, 50-move rule.

## Gameplay & Controls
- Interaction is in the 3D scene; the 2D board is a read-only mirror with highlights.
- 3D: click origin, then destination (2D/3D are derived from the same game state).
- Camera modes: Player (human POV), Studio (wide shot), Free (orbit controls).
- Info panel shows current turn, total moves, and an optional max-moves limit. You can:
  - Start a New Game
  - Export the current game as JSON
  - Import a game JSON to replay moves
  - Toggle Play vs Bot (training heuristic with move explanations; plays as Black by default)
- End-of-game: when checkmate or max-moves is reached, the app records a summary and shows a prompt with:
  - Start New Game
  - Rematch (swap colors)
  - Keep Viewing (no reset)

## Export/Import Format (Game)
Game export uses **schema version 2** (v1 still accepted on import). Each move in v2 includes `fen` (FEN after that move). Import replays moves for all versions; FEN in v2 is for reproducibility/validation.

## Stats (localStorage)
Stats are stored under `chess.stats` as:

```
{
  "schemaVersion": 1,
  "totalGames": 12,
  "winsWhite": 6,
  "winsBlack": 4,
  "games": [
    {
      "id": "game-1712345678",
      "moves": 34,
      "capturedWhite": 5,
      "capturedBlack": 7,
      "winner": "WHITE" | "BLACK" | null,
      "startedAt": "2025-03-01T10:20:30.000Z",
      "endedAt": "2025-03-01T10:35:01.000Z",
      "pgn": "[Event \"?\"] ..."
    }
  ]
}
```

- Export/Import stats from the UI.
- Each finished game can store **PGN**; Stats panel offers **Copy PGN** / **Show PGN** per game.
- Schema versioning is in place for future migrations.

## Optional Wood Textures (Board)
- The board supports PBR wood maps. Place textures in `public/textures/` with these names to enable them:
  - `wood_oak_light.jpg`, `wood_oak_light_normal.jpg`, `wood_oak_light_rough.jpg`
  - `wood_walnut_dark.jpg`, `wood_walnut_dark_normal.jpg`, `wood_walnut_dark_rough.jpg`
- If textures are missing, solid-color fallbacks are used.

## Three.js Notes
- ACES Filmic tone mapping is enabled; legacy lights disabled for more physical results.
- Materials for pieces emulate painted-ebony and boxwood; the board uses a satin wood finish.
- Board squares are batched via `InstancedMesh` (light/dark) to reduce draw calls.
- Piece movement uses short tweens to mirror the latest move history.

## Testing Strategy
- Current: Vitest runner with per-piece unit tests, a perft position suite, special-move coverage, and chess-scene smoke tests (`src/chess-scene/__tests__/builders.test.ts`).
- Planned: extend legality coverage (check, self-check edge cases) plus lightweight scene builder snapshots.

## Versioning
Current version: **0.6.1** (2026-02-28). See `CHANGELOG.md` for details.

## Status and Roadmap
| Area | Done | In progress | Planned |
| --- | --- | --- | --- |
| Engine rules | core piece movement, captures, self-check, special moves, threefold, 50-move rule | perft diagnostics | load from FEN |
| Export/Import | JSON v2 with FEN per move; legacy v1 accepted; PGN per game in stats | — | PGN import |
| Bot | training heuristic bot with move feedback | evaluation tuning | minimax depth 2/3 |
| 3D scene | board + pieces + materials + lighting, move tweens, instanced board squares | raycast selection | InstancedMesh / mergeGeometries for pieces |
| UI/UX | export/import, stats, i18n, static export | settings panel | keyboard shortcuts, mobile polish |
| Testing | Vitest runner, scene builder smoke tests, special-move tests | domain legality tests | perft benchmarks |

## CI/CD (GitHub Actions)
A single workflow handles lint, build, and deploy to GitHub Pages.

- Triggers: on `push` to `main` and manual runs via `workflow_dispatch`.
- Steps: `checkout` -> `setup-node@20` (npm cache) -> restore `.next` cache -> `npm ci` -> `npm run lint` -> `npm run test` -> `npm run build` -> `configure-pages` -> `upload-pages-artifact` (from `chessgame/out`) -> `deploy-pages`.
- Concurrency: prevents overlapping deployments (`cancel-in-progress: true`).
- Permissions: `pages: write` and `id-token: write` to publish to Pages.

How to enable:
- In GitHub, go to `Settings > Pages` and set `Source: GitHub Actions`.
- Ensure default branch is `main`; no secrets are needed (static build).

Workflow location: `.github/workflows/nextjs.yml`.

### Note on `npm ci` and the lockfile
- The pipeline uses `npm ci` for reproducible installs. If you add dependencies or devDependencies, run `npm install` locally and commit the updated `package-lock.json`.
- If `package.json` changes but the lockfile does not, `npm ci` will fail with an `EUSAGE` error and messages like "Missing ... from lock file".

## Standards and Conventions
- Layered architecture and separation of concerns:
  - `domain/`: the chess engine (pure classes, no UI/Three.js dependencies).
  - `chess-scene/`: pure functions to build geometries, materials, and lights.
  - `app/`: UI orchestration (React components, hooks, i18n, view helpers).
- Strict TypeScript:
  - `tsconfig.json` with `strict: true`, `moduleResolution: bundler`, and alias `@/* -> src/*`.
  - Grouped exports with barrel files (`index.ts`) in `domain/chess` and `chess-scene`.
- Code style:
  - ESLint flat config (`eslint.config.mjs`) based on `next/core-web-vitals` + `next/typescript`.
  - Naming conventions: components in PascalCase (`BoardGrid.tsx`), utilities in camelCase.
  - Prefer pure functions and immutable data for builders (especially in `chess-scene`).
- App Router and client components:
  - UI files using state/effects start with `'use client'`.
  - Hooks encapsulate state and effects (for example `useChessUI`).
- Styles:
  - Tailwind CSS v4 via PostCSS plugin; `globals.css` declares theme tokens with `@theme inline`.
- i18n:
  - `TranslationProvider` with static dictionaries (`en`, `es`). Keys centralised in `translations.ts`.
- Accessibility:
  - ARIA labels on board squares and visible focus for interactions.

## References and Credits
- Inspiration for Three.js piece modeling: https://github.com/Sushant-Coder-01/chess3d
  - Similar techniques are used here (lathe profiles, composite groups, crowns/merlons) adapted to this project's style.

## License
- MIT

## Notes
- 3D rendering:
  - The canvas mounts in `ChessScene.tsx` and consumes builders from `@/chess-scene`.
  - Canvas size syncs on `resize`; the render loop is properly cleaned up.
- Domain <-> scene sync:
  - The UI derives `scenePieces` from game state (see `useChessUI`).
  - Selection and allowed destinations are memoised to avoid extra renders.
- Static export and GitHub Pages:
  - `basePath` derives from `GITHUB_REPOSITORY`, useful for user/gh-pages repos.
- Import aliases:
  - Use `@/` instead of deep relative paths (configured in `tsconfig.json`).
