# Chess UI Module

## Overview
Composable utilities that transform chess domain state into UI-friendly data structures. These helpers centralise formatting and derived calculations used throughout the Next.js pages.

## Module Layout
```
chess-ui/
  helpers.ts   Shared formatters and mappers consumed by UI components
```

## Responsibilities
- Bridge between domain objects (pieces, moves, board) and presentation widgets.
- Provide memo-friendly helpers so React components avoid redundant calculations.
- Keep view logic out of hooks and components that should focus on rendering.

## Extension Points
- Add new helper functions when new panels or overlays need derived data.
- Promote heavily reused helpers into separate files to keep `helpers.ts` concise.
- Pair future helpers with Jest tests to lock down formatting expectations.
