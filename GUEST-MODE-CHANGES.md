# Guest mode and profile navigation changes

Changed directly in the existing merged project at outputs/Plotby-Property-Access-Fix/Plotby. No new project, navigation root, Supabase client, dependency, database table or policy was created.

## Exact modified/added runtime files

| File (old → new for canonical JS/JSX renames) | Change |
| --- | --- |
| `src/services/guestPropertyStore.js` | Added isolated, persistent, serialized device-local guest CRUD with test-only IDs and null user ownership. |
| `src/services/propertyService.ts → src/services/propertyService.js` | Added nullable-session workspace selection, verified owner-filtered account operations, local guest submission, detail/delete scope boundaries and account-change checks. Removed unscoped property fetching. |
| `src/services/propertyAccess.ts → src/services/propertyAccess.js` | Retained structured account-access/schema errors in JavaScript; missing sessions are normal guest state in the service. |
| `src/navigation/MainTabs.tsx → src/navigation/MainTabs.jsx` | Profile tab now renders the existing My Properties screen through PropertyWorkspace; original dark/green tabs retained. |
| `src/navigation/PropertyWorkspace.jsx` | Added thin navigation callbacks for the original My Properties menu. Edit Profile/Subscription/login/saved/help/logout remain; logout stays in guest workspace. |
| `src/navigation/appnavigator.tsx → src/navigation/appnavigator.jsx` | Removed normal-route RequirePropertyAccess wrappers and duplicate root MyProperties registration. Registered original ProfileScreen once as EditProfile. |
| `src/navigation/authReturn.ts → src/navigation/authReturn.js` | OTP return for My Properties selects the Profile tab; Add Property edit parameters remain preserved. |
| `src/navigation/types.ts` | Updated existing route metadata: EditProfile replaces the removed duplicate MyProperties stack route. No new TypeScript runtime implementation was added. |
| `src/screens/forms/AddPropertyScreen.tsx → src/screens/forms/AddPropertyScreen.jsx` | Preserved original form/validation and delegated submission to current workspace. Guest success says device-only; success returns to My Properties. Removed automatic Sign In redirects and stale direct Supabase import/debug payload logging. |
| `src/screens/property/MyPropertiesScreen.tsx → src/screens/property/MyPropertiesScreen.jsx` | Retained categories/cards/menu/theme; added local guest scope/empty state and optional Sign In menu entry. Refreshes after submission/auth changes, clears stale rows and searches actual address/city fields. |
| `src/browse/PropertyDetailsScreen.tsx → src/browse/PropertyDetailsScreen.jsx` | Uses current-workspace details/deletion, supports local guest records, clears private rows on auth changes and confirms deletion on web/native. |
| `src/browse/features/plots/hooks/index.ts → src/browse/features/plots/hooks/index.js` | Loads only workspace records; clears map data on session/city changes and invalidates obsolete requests. |
| `tests/integration.test.cjs` | Expanded/updated to 18 tests covering guest CRUD, zero guest property-table calls, cross-user filtering, forged ownership/status, auth failure, account switch, navigation and existing map regressions. |
| `README.md` | Updated current guest/profile/privacy behavior and retained install/configuration instructions. |
| `PROPERTY-ACCESS-FIX.md` | Replaced obsolete compulsory-gate guidance with local guest behavior and account-only backend prerequisites. |
| `VERIFICATION.md` | Appended the current implementation verification and explicit limits. |
| `GUEST-MODE-CHANGES.md` | Added this current per-file change and verification report. |

The superseded .ts/.tsx implementations in the rename rows are removed so Metro cannot resolve an old compulsory-gate version. Unrelated TypeScript modules remain. The unused RequirePropertyAccess component remains available for genuinely protected flows but is not imported by normal navigation.

## Guest mode

The unchanged AsyncStorage dependency persists guest test records under @plotby/guest-test-properties:v1. IDs are prefixed guest-test:, storage_mode is guest-test, and user_id is null. Supabase property-table APIs are never called for guest list/save/edit/details/delete. Guest entries appear only in the current device/browser-origin test workspace. Signing in hides that local workspace and does not upload/merge its records. Signing out clears account rows before reloading local test data.

Guest submissions reuse all original form steps, validation, pricing and coordinates. The success popup explicitly says they are not uploaded. This is functional device-local testing, not a simulated successful Supabase write. Guest records are not available across devices, and clearing app/browser storage removes them.

## Account data and privacy

A stored session is validated with auth.getUser before account access. Queries filter by the verified user's id, mutations also filter the selected property id, and saves override any supplied owner id. Approval/status fields are not writable through the regular form service. An invalid existing session does not silently become a guest submission. Account changes clear cached map/list/detail rows and cancel obsolete responses.

The supplied schema has no explicit public/published property listing view, so unscoped select-all browsing was removed. Signed-out maps show only device-local test properties; signed-in maps/My Properties show only that verified user's records. This prevents normal guest browsing from exposing private account property rows.

## Profile navigation

Profile icon/tab → one original My Properties implementation. Its existing avatar menu → Edit Profile → original ProfileScreen, with Back returning to My Properties. Subscription, Saved Properties, Help & Support, optional login entries and Logout remain. Existing login/OTP screens remain available; Logout no longer navigates to a compulsory login screen.

## Backend still required for signed-in storage

A public-key, zero-row read of properties.user_id returned HTTP 400 / PostgreSQL 42703 (column does not exist). Therefore live authenticated save/filter tests are blocked by missing ownership storage, not by guest mode. The minimum ownership change is an owner UUID column referencing the authenticated user (default user_id, or a configured existing custom column), plus reviewed server RLS that restricts private reads and writes to the true owner. Existing unowned rows must be assigned only when an administrator can establish their owners.

The existing database diagnostics/review SQL files were not executed. No grants, RLS or policies were changed and no service-role key was used. Local guest testing requires no Supabase policy change. Cloud guest persistence is not implemented by this local testing mode.

## Agent verification

No Agent Verification screen, approve/reject UI, agent role checker or agent approval service exists in the available project copy. The existing Login as Agent menu entry remains optional and does not grant roles or show approval controls. No approval/rejection controls were added for guests or ordinary users. The claimed existing authorized-agent workflow cannot be end-to-end verified without its actual source and policy definitions.

## Checks

- 18 automated tests passed, including signed-in owner filtering with mock users/rows and denial of cross-workspace mutations.
- Existing TypeScript validation passed. Changed JS/JSX modules were checked by lint and real Expo bundles.
- Lint: 0 errors; 10 pre-existing unused-variable/import warnings remain in legacy screens.
- Android, iOS and web production JavaScript/assets exports succeeded.
- Browser startup without a session: passed; private property lists were empty.
- Profile icon → My Properties: passed.
- Guest Add Property: completed all three original steps, chose a map coordinate and saved a fictional local QA record. No login prompt was required.
- Return/list refresh and browser reload persistence: passed; the test property appeared in the existing cards/categories with device-only labeling.
- Separate Edit Profile navigation and Back: passed.
- Web native-map codegen exclusion regression: checked after export.
- No live authenticated mutation, OTP delivery, agent approval or native device session was tested. The missing owner column prevents live authenticated account validation.

package.json, package-lock.json, .env, app.json, app.config.js and src/lib/supabase.ts are byte-for-byte unchanged from the inspected project. No dependency install is needed for these changes. Restart Metro with --clear after the JS/JSX renames.
