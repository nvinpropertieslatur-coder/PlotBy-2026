---
name: plotby-architecture
description: Enforce Plotby's scalable Expo Router and feature-based architecture when creating or refactoring app features.
---

# Plotby Architecture

Use strict TypeScript, thin Expo Router route files, and feature modules under `src/features`. Put reusable components in `src/components`, use named exports except where Expo Router requires defaults, and use the configured `@/` alias. Separate UI, hooks, services, schemas, and types; keep network operations out of presentation components and avoid circular dependencies.

Before implementation, inspect conventions and reuse existing code. Keep exactly three bottom tabs—Property, Offers, Profile—and keep Add Property inside Profile. Support only Add Plot initially. Implement the smallest maintainable change, then run TypeScript, lint, and relevant tests and summarize the result.
