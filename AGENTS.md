# PLOTBY — AI DEVELOPMENT INSTRUCTIONS

Plotby is a map-first real-estate app built with Expo, React Native, TypeScript, Expo Router, Supabase, and `react-native-maps`. The current map uses configurable OpenStreetMap-compatible `UrlTile` imagery and local sample plots; backend data is not connected yet.

## Product rules

- Use exactly three tabs: Property, Offers, Profile.
- Add Property belongs inside Profile.
- Support only Add Plot in the initial release.
- Use the dark premium visual system: background `#101310`, surface `#1C211C`, elevated surface `#282E28`, neon primary `#C9FF32`, yellow accent `#F6C92B`, primary text `#F7F9F5`, muted text `#A7B0A5`, border `#343B34`, error `#FF6666`.

## Engineering rules

1. Inspect the codebase before changing it.
2. Reuse components before creating new ones; keep screens thin and feature logic under `src`.
3. Follow relevant Plotby and official Expo skills.
4. Centralize theme values; never hardcode brand styling in screens.
5. Use typed interfaces, schemas, loading/error/empty states, accessibility labels, safe areas, and adequate touch targets.
6. Keep pricing and validation logic single-sourced and test important business rules.
7. Never expose Supabase service-role secrets. Do not add MapLibre Native, WebViews, or custom development builds for the current map phase.
8. Keep map tile URLs configurable, preserve attribution, and do not assume public OSM tile servers support unrestricted production traffic.
9. Do not change unrelated functionality.

## Workflow

For each phase, inspect existing code, state scope, identify reusable pieces, implement only the requested phase, run available TypeScript/lint/tests, and report changed files and test results. Do not generate the entire app in one task.
