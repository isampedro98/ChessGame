# i18n Module

## Overview
Internationalisation utilities that wire translations into the chess app. Centralises provider setup and language resources so localisation stays consistent across pages.

## Module Layout
```
i18n/
  TranslationProvider.tsx   React context that exposes translation helpers
  translations.ts           Static translation dictionaries per supported locale
```

## Responsibilities
- Configure the context provider consumed throughout the component tree.
- Load and expose translation dictionaries keyed by locale codes.
- Offer helper functions to look up messages and handle missing keys gracefully.

## Extension Points
- Extend `translations.ts` with additional locales or namespaces as the UI grows.
- Add lazy-loading or dynamic import logic when translation bundles become large.
- Provide testing utilities that render components with a mock translation context.
