# Contributing

Thanks for helping improve ChessGame.

## Contribution Scope
- Engine correctness (rules, legality checks, deterministic replay)
- UI/UX improvements (clarity, accessibility, beginner guidance)
- 3D scene rendering and performance polish
- Documentation and testing quality

## Workflow
1. Open an issue first for non-trivial changes.
2. Keep PRs focused on one concern.
3. Add or update tests when changing domain behavior.
4. Update docs (`README.md`, `CHANGELOG.md`, `IMPROVEMENTS.md`) when relevant.

## Engineering Expectations
- Preserve layered boundaries: `domain` -> orchestration/hooks -> UI/scene projection.
- Avoid introducing game-rule state outside domain classes.
- Prefer explicit typing and small pure helpers for deterministic behavior.

## Recommended Issue Labels
- `good first issue`
- `architecture discussion`
- `engine correctness`
- `ui polish`

## Pull Request Checklist
- [ ] Changes are scoped and explained clearly.
- [ ] Tests pass locally (`npm run test`).
- [ ] Lint passes locally (`npm run lint`).
- [ ] Docs updated when behavior or architecture changed.