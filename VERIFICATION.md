# Verification results — 30 October 2026

| Check | Result |
| --- | --- |
| Clean dependency install (`npm ci`) in a separate validation copy | Passed; 807 packages installed |
| TypeScript (`tsc --noEmit`) | Passed, zero compilation errors |
| `expo lint` | Passed with zero errors and 10 inherited warnings (unused variables/imports and duplicate imports in primary screens) |
| `npm test` | Passed, 5 tests |
| `expo install --check` | Dependencies up to date using SDK 57 bundled compatibility data; EXPO_OFFLINE=1 avoided an inaccessible global Expo cache |
| `expo-doctor` | 21/21 checks passed |
| `expo export --platform all` | Android, iOS and web JavaScript/assets exported successfully |
| Single navigation/client and absence of sample records/Router/old navbar imports | Automated test passed |
| Supabase REST schema request | HTTP 401; live schema/credentials not verified |
| Emulator/physical device | Not run; Android adb was not available on PATH |

The tests exercise numeric database-field mapping, preservation of coordinates/prices/contact data, rejection of missing/blank/invalid/out-of-range coordinates, valid zero coordinates, selection after deletion/city changes, multiword city identifiers, and the single-root/client architecture.

The source retains existing primary `@ts-nocheck` directives, rather than claiming a full strict TypeScript migration of all legacy screens. Added navigation and browsing files are checked. Existing form validation was retained; interactive form behavior has not been exercised on a device.

## Checks still needed with a working backend and device

- Confirm the existing properties owner column, set EXPO_PUBLIC_PROPERTY_OWNER_COLUMN, and validate the supplied public URL/key.
- Verify RLS with two distinct users: one user must not edit/delete the other's property. No policy or table migration was performed.
- Sign in by SMS OTP, save/edit Profile, add a property with the original three-step form, confirm the original success alert, edit it, and delete it.
- Verify My Properties contains only owned rows, and that add/edit/delete changes are reflected when returning to the map.
- Pan/zoom, select markers/cards, switch Map/List, choose cities and map styles, and check MapTiler tile responses.
- Inspect small and large Android/iOS screens, gesture insets, keyboard behavior, back navigation, and absence of overlaps.
- Confirm property images match the actual existing database storage format. The primary source supplied no property image upload backend.
- Exercise subscription UI; payment processing was absent from the supplied source and is not implemented.

## Dependency audit

npm audit reported 8 transitive findings: 5 low and 3 high, including a Zod advisory in Expo CLI tooling. Its suggested forced resolution downgrades Expo to SDK 51. That incompatible change was not applied. This project is NOT reported as vulnerability-free. Use a patched SDK 57 tooling release when available rather than forcing a major SDK downgrade or incompatible dependency override.

## Environment and validation notes

The first install encountered restricted global npm/Expo cache access. A workspace npm cache and a clean validation copy were used successfully. No permissions outside the provided project were changed. Dependency directories, validation builds and caches are excluded from the deliverable.

Bundling is a compiler/import/assets check; it does not establish native map rendering, OTP delivery, backend mutation success, or UI layout correctness. Those checks remain unverified.

## Follow-up: browser native-codegen crash

The reported `codegenNativeComponent is not a function` originated from eager loading of react-native-maps native Fabric specs in the web runtime. A `.web.tsx` map implementation now uses Leaflet; native map code is unchanged. A web-only location picker also prevents native WebView from being used in browser forms.

Verified in the browser: app renders, 18 raster tiles loaded successfully in one observed viewport, an actual database property marker/card appears, Map/List switches, city selection opens/changes cities, map style selection switches to Dark, and the original Profile opens the original multi-step form. On its location step, selecting a map point and confirming returned latitude/longitude to the original form. No property was saved or modified during this UI check. The browser error log contained no matching codegenNativeComponent errors.

An export regression check also confirms that RNMapsGooglePolygon, RNMapsMapView and codegenNativeComponent are absent from the web JavaScript bundle. Browser marker hit areas have explicit dimensions for mouse/keyboard accessibility. Native device, OTP, profile persistence and database mutation testing remain outstanding.

## Follow-up: property access / SafeAreaView

Read-only public REST inspection confirmed that properties has no ownership column; `select=user_id&limit=0` returned HTTP 400 / PostgreSQL 42703. The OpenAPI endpoint's HTTP 401 explicitly says it requires a secret API key; this did not indicate invalid public mobile credentials. The users id/phone zero-row probe returned HTTP 200.

The previous mandatory EXPO_PUBLIC_PROPERTY_OWNER_COLUMN check is removed. The code defaults to the reviewed user_id column and treats missing storage as an ownership-setup state before a form opens. Signed-out management is routed through the original Sign In/OTP screens and resumes the requested route. TypeScript and 11 automated tests pass. Lint: 0 errors, 10 inherited warnings. The application has no core React Native SafeAreaView imports.

The additive ownership SQL and metadata/policy diagnostics were prepared for review only. No database row, schema, grant or RLS policy was changed. OTP delivery, authenticated inserts/updates/deletes and server policy enforcement remain unverified until administrator setup/sign-in.

## Current guest-testing/profile request

The latest behavior and exact file inventory are in GUEST-MODE-CHANGES.md; it supersedes earlier compulsory sign-in/form-gate descriptions in historical sections above. 18 automated tests pass. Existing TypeScript validation passes; lint has 0 errors and 10 legacy warnings. Android/iOS/web exports succeed. Browser guest startup, the original three-step property submission, list refresh, reload persistence, Profile→My Properties, separate Edit Profile and Back were exercised successfully using a device-local fictional QA record. Authenticated owner filtering was tested with controlled mock sessions/rows; live account operations remain blocked by PostgreSQL 42703 for the absent properties.user_id column. No Agent Verification implementation is present in the inspected source. No database or policy changes were made.
