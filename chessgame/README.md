# ChessGame

Next.js application that pairs a TypeScript chess engine with a fully rendered Three.js board. The repository houses the domain logic, a modular 3D scene, and the UI layer that ties everything together.

## Requirements
- Node.js 20+
- npm 10+

Install dependencies once:
```bash
npm install
```

## Development
```bash
npm run dev
```
Visit http://localhost:3000 to explore the UI, play through moves, and see the synchronised 3D scene.

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
- TypeScript engine models positions, moves, and board state under `src/domain/chess`.
- Next.js page (`src/app/page.tsx`) renders history panels, the 3D scene, and live board state.
- Three.js helpers in `src/chess-scene` provide reusable builders for geometries, lighting, and materials.
- Internationalisation layer under `src/app/i18n` ships English and Spanish translations.
- Roadmap: special-move polish (castling, en passant animations), richer piece materials, and interactive camera controls.
