# PropertyApp TypeScript migration

All application JavaScript and JSX source files have been renamed to TypeScript `.ts` / `.tsx`. The Expo config and ESLint config remain JavaScript because they are tooling configuration files.

## Install and run

```bash
npm install
npx expo install --fix
npx expo-doctor
npx expo start -c
```

Recreate your local `.env` file using your existing private values; environment files were intentionally excluded from the ZIP.

## Important limitations

This is a **transitional TypeScript conversion**, not a fully typed refactor. Existing source files contain `// @ts-nocheck` to preserve runtime behavior while migrating syntax. Remove it file-by-file after defining navigation, component props, Supabase models, and state types.

The uploaded `package.json` uses Expo SDK 57. This migration does not downgrade Expo to SDK 55 or resolve Expo package compatibility. Run `npx expo-doctor` and resolve any dependency warnings before building.
