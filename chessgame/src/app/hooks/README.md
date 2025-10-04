# Hooks Module

## Overview
React hooks that encapsulate UI state management for the chess application. Hooks expose stable, memoised APIs so components can focus on rendering.

## Module Layout
```
hooks/
  useChessUI.ts   Derives board, history, and selection state for the UI layer
```

## Responsibilities
- Coordinate state between domain services and presentational components.
- Provide memoised callbacks and selectors to reduce React re-renders.
- Own side effects (timers, subscriptions) related to the chess UI surface.

## Extension Points
- Add new hooks when a feature needs reusable stateful logic across components.
- Keep hooks pure and parameterised so they can be tested with lightweight mocks.
- Co-locate hook-specific tests and types to document the public contract.
