# Components Module

## Overview
React components that render the chess experience inside the Next.js application. Components are grouped here to keep the `/app` tree focused on routing while UI elements remain reusable.

## Module Layout
```
components/
  BoardGrid.tsx        Board layout, coordinates, and highlights
  ChessScene.tsx       Three.js canvas wrapper that mounts the scene helpers
  HistoryPanel.tsx     Move list with scrolling and contextual actions
  InfoPanel.tsx        Summary of the current game state (turn, status, etc.)
  LanguageSwitcher.tsx Locale toggle hooked into the i18n provider
```

## Responsibilities
- Render presentational UI while delegating state management to hooks.
- Compose lower-level utilities from `@/chess-scene`, `@/app/chess-ui`, and domain modules.
- Expose clear props so the same components work across pages or future storybook entries.

## Extension Points
- Introduce new panels or overlays by adding files here and wiring them into the page.
- Split shared subcomponents into nested folders if this directory grows large.
- Add unit or visual tests (e.g. Playwright, Storybook) alongside components to lock layout.
