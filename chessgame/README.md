# ChessGame

Next.js application that pairs a TypeScript chess engine with a fully rendered Three.js board. The repository houses the domain logic, a modular 3D scene, and the UI layer that ties everything together.

## Tech Stack
- Next.js 15 (App Router, `output: 'export'` para hosting estático)
- React 19
- TypeScript estricto (`strict: true`, alias de paths `@/*`)
- ESLint (flat config) con `next/core-web-vitals` + `next/typescript`
- Tailwind CSS v4 vía `@tailwindcss/postcss`
- Three.js para la escena 3D

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

## Build & Static Export
- El proyecto está configurado para export estático (`next.config.ts` usa `output: 'export'`).
- `npm run build` genera el sitio en `out/` listo para cualquier hosting estático.
- Si se despliega en GitHub Pages, `basePath` se ajusta automáticamente desde `GITHUB_REPOSITORY`.

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

## Estándares y Convenciones
- Estructura en capas y separación de responsabilidades:
  - `domain/` contiene el motor de ajedrez (clases puras, sin dependencias de UI/Three.js).
  - `chess-scene/` expone funciones puras para construir geometrías, materiales y luces.
  - `app/` orquesta la UI (componentes React, hooks, i18n, helpers de vista).
- TypeScript estricto:
  - `tsconfig.json` con `strict: true`, `moduleResolution: bundler` y alias `@/* -> src/*`.
  - Exportaciones agrupadas con “barrel files” (`index.ts`) en `domain/chess` y `chess-scene`.
- Estilo de código:
  - ESLint flat config (`eslint.config.mjs`) basado en `next/core-web-vitals` + `next/typescript`.
  - Convenciones de naming: componentes en PascalCase (`BoardGrid.tsx`), utilidades en camelCase.
  - Preferir funciones puras y datos inmutables para builders (especialmente en `chess-scene`).
- App Router y componentes cliente:
  - Archivos de UI que usan estado/efectos comienzan con `'use client'`.
  - Hooks encapsulan estado y efectos (p. ej. `useChessUI`).
- Estilos:
  - Tailwind CSS v4 via PostCSS plugin; `globals.css` declara theme tokens con `@theme inline`.
- i18n:
  - `TranslationProvider` con diccionarios estáticos (`en`, `es`). Claves centralizadas en `translations.ts`.
- Accesibilidad:
  - Etiquetas ARIA en casillas del tablero y foco visible en interacciones.

## Cosas a Tener en Cuenta
- Render 3D:
  - El canvas se monta en `ChessScene.tsx` y consume builders de `@/chess-scene`.
  - El tamaño del canvas se sincroniza en `resize`; el render loop se limpia correctamente.
- Sincronización dominio ↔ escena:
  - La UI deriva `scenePieces` desde el estado del juego (ver `useChessUI`).
  - La selección y los destinos disponibles se calculan con `useMemo` para evitar renders extra.
- Export estático y GitHub Pages:
  - `basePath` se ajusta en base a `GITHUB_REPOSITORY`, útil para repositorios de usuario/gh-pages.
- Alias de imports:
  - Usar `@/` en lugar de rutas relativas profundas (configurado en `tsconfig.json`).

## Próximos Pasos (Roadmap sugerido)
- Motor de ajedrez
  - Implementar detección de jaque/jaque mate, ahogado y legalidad completa (evitar auto-jaque).
  - Añadir movimientos especiales dedicados: `CastleMove`, `EnPassantMove`, `PromotionMove`.
  - Soporte de FEN/PGN: importar posiciones, exportar historial y partidas.
- Escena Three.js
  - OrbitControls para la cámara y posiciones predefinidas (overview, lateral).
  - Raycasting para seleccionar piezas/casillas con el mouse directamente en 3D.
  - Animaciones de movimiento y captura (tweens) sincronizadas con el historial.
  - Materiales y texturas avanzadas (madera, metal, PBR) y labels de coordenadas.
- UI/UX
  - Modo móvil y mejoras de responsividad; accesos rápidos de teclado.
  - Estado de partida guardado en `localStorage` y reinicio rápido.
  - Panel de configuración (tema, idioma, velocidad de animación).
- Calidad y DX
  - Tests unitarios (Vitest/Jest) para `domain/` y utilidades de `chess-scene`.
  - Storybook para componentes (`components/`) y visuales de piezas.
  - Integrar Prettier y hooks de pre-commit (lint-staged) para formato/validaciones.
  - CI/CD (GitHub Actions) con lint + build + deploy a GitHub Pages (aprovechando `out/`).
