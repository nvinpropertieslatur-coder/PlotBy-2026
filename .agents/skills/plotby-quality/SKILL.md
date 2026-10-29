---
name: plotby-quality
description: Audit Plotby changes for maintainability, accessibility, security, performance, and test coverage.
---

# Plotby Quality Standards

Before coding, inspect the implementation, identify reusable code, and constrain the change to the smallest affected feature. After coding, run TypeScript, ESLint, and relevant unit tests. Check for duplicated components, hardcoded colors, missing loading/empty/error states, unsafe keyboard or safe-area behavior, missing accessibility labels/touch targets, Supabase access-control gaps, map/carousel synchronization bugs, and performance regressions.

Report: implementation summary; files created; files modified; reusable components added; tests actually run and results; remaining limitations. Never claim an unexecuted check passed and never silently replace working functionality.
