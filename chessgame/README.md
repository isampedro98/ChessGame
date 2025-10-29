# ChessGame

Next.js application that pairs a TypeScript chess engine with a fully rendered Three.js board. The repository contains the domain logic, a modular 3D scene, and the UI layer that ties everything together.

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
Visit http://localhost:3000 to explore the UI, play through moves, and see the synchronised 3D scene.

## Build & Static Export
- The project is configured for static export (`next.config.ts` sets `output: 'export'`).
- `npm run build` produces the site in `out/`, ready for any static host.
- When deployed to GitHub Pages, `basePath` is set automatically from `GITHUB_REPOSITORY`.

## CI/CD (GitHub Actions)
A single workflow handles lint, build, and deploy to GitHub Pages.

- Triggers: on `push` to `main` and manual runs via `workflow_dispatch`.
- Steps: `checkout` → `setup-node@20` (npm cache) → restore `.next` cache → `npm ci` → `npm run lint` → `npm run build` → `configure-pages` → `upload-pages-artifact` (from `chessgame/out`) → `deploy-pages`.
- Concurrency: prevents overlapping deployments (`cancel-in-progress: true`).
- Permissions: `pages: write` and `id-token: write` to publish to Pages.

How to enable:
- In GitHub, go to `Settings > Pages` and set `Source: GitHub Actions`.
- Ensure default branch is `main`; no secrets are needed (static build).

Workflow location: `.github/workflows/nextjs.yml`.

### Note on `npm ci` and the lockfile
- The pipeline uses `npm ci` for reproducible installs. If you add dependencies or devDependencies, run `npm install` locally and commit the updated `package-lock.json`.
- If `package.json` changes but the lockfile does not, `npm ci` will fail with an `EUSAGE` error and messages like “Missing ... from lock file”.

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

## Useful Scripts
```bash
npm run lint    # Run ESLint using the project configuration
```

## Current Status
- The TypeScript engine models positions, moves, and board state under `src/domain/chess`.
- The Next.js page (`src/app/page.tsx`) renders history panels, the 3D scene, and live board state.
- Three.js helpers in `src/chess-scene` provide reusable builders for geometries, lighting, and materials.
- The internationalisation layer under `src/app/i18n` ships English and Spanish translations.
- Roadmap highlights: special-move polish (castling, en passant animations), richer piece materials, and interactive camera controls.

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
  - Similar techniques are used here (lathe profiles, composite groups, crowns/merlons) adapted to this project’s style.

## Notes
- 3D rendering:
  - The canvas mounts in `ChessScene.tsx` and consumes builders from `@/chess-scene`.
  - Canvas size syncs on `resize`; the render loop is properly cleaned up.
- Domain ↔ scene sync:
  - The UI derives `scenePieces` from game state (see `useChessUI`).
  - Selection and allowed destinations are memoised to avoid extra renders.
- Static export and GitHub Pages:
  - `basePath` derives from `GITHUB_REPOSITORY`, useful for user/gh-pages repos.
- Import aliases:
  - Use `@/` instead of deep relative paths (configured in `tsconfig.json`).

## Roadmap (Suggested)
- Chess engine
  - Check/checkmate, stalemate, and full legality (avoid self-check).
  - Dedicated special moves: `CastleMove`, `EnPassantMove`, `PromotionMove`.
  - FEN/PGN support: import positions, export history and games.
- Three.js scene
  - OrbitControls for the camera and preset viewpoints (overview, side). [Added]
  - Physical environment (RoomEnvironment + PMREM) for better reflections. [Added]
  - Raycasting to select pieces/squares directly in 3D.
  - Movement/capture animations (tweens) synced with history.
  - Physical materials (clearcoat, sheen), advanced textures (wood/metal/PBR), and coordinate labels. [Partially added]
  - Future optimisation: `InstancedMesh` for pawns and `mergeGeometries` to reduce draw calls.
- UI/UX
  - Mobile mode and responsive improvements; keyboard shortcuts.
  - Persist game state in `localStorage` and quick reset.
  - Settings panel (theme, language, animation speed).
- Quality and DX
  - Unit tests (Vitest/Jest) for `domain/` and `chess-scene` utilities.
  - Storybook for components (`components/`) and piece visuals.
  - Integrate Prettier and pre-commit hooks (lint-staged) for formatting/validation.
- CI/CD (GitHub Actions) with lint + build + deploy to GitHub Pages (using `out/`).

