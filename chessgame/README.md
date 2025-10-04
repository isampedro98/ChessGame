# ChessGame

Next.js application to experiment with a TypeScript chess engine and a future Three.js board.

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

Visit [http://localhost:3000](http://localhost:3000) to see the UI. The page renders the board from the domain model and a Three.js scene placeholder.

## Useful scripts

```bash
npm run lint   # Executes ESLint using the project configuration
```

## Current status

- Domain modeled with TypeScript classes under `src/domain/chess` (board, moves, pieces, game, factories).
- Main page (`src/app/page.tsx`) displays the board, move history, and a Three.js stage.
- Internationalization via a lightweight provider supports English and Spanish UI text.
- Upcoming work: special move rules (castling, en passant, promotion flows), animated synchronization between the domain and the 3D scene, richer visual assets for the pieces.
