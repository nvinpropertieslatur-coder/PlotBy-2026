# Plotby

Integrated from the supplied propertyAppFolder (primary) and PlotBy-2026 (map, geographic property browsing, Offers, and tab styling). This is the primary project with source integration, not a replacement scaffold.

## Install and run

Use Node 24 LTS and npm. Extract this archive, open a terminal in Plotby, then run:

```sh
npm ci
npx expo install --check
npx expo-doctor
npm start
```

Open the Android or iOS app in a compatible Expo Go installation for SDK 57. For standalone Android builds, configure your app-restricted Google Maps Android key in EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY before generating/building native projects. See https://docs.expo.dev/versions/v57.0.0/sdk/map-view/ . No native directories are bundled or edited.

## Required environment setup

The original primary .env values are preserved. The secondary public map configuration is appended only for names absent from the primary environment. Do not commit .env. The archive intentionally excludes node_modules, .expo, .git, and Supabase CLI cache files.

- EXPO_PUBLIC_SUPABASE_URL: primary Supabase URL.
- EXPO_PUBLIC_SUPABASE_ANON_KEY: public anon/publishable key. The original EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is a fallback, preserving the provided configuration. Never use a service-role key.
- EXPO_PUBLIC_PROPERTY_OWNER_COLUMN: optional override for an existing custom owner column. The default is user_id. The inspected database currently has no owner column; review PROPERTY-ACCESS-FIX.md and the database/*.sql files before enabling per-user management. Owner storage is checked only for account operations. Opening the form and local guest submissions do not require it.
- EXPO_PUBLIC_MAPTILER_KEY: public map tile key, used for satellite/streets/basic/dark styles. The source's key is preserved if available. Optional XYZ raster template settings are listed in .env.example. Provider credentials, quotas, licensing and tile availability must be verified by the owner.
- EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY: standalone Android map SDK key. MapTiler imagery still requires the native map SDK host on Android.

Public property reads succeeded. The OpenAPI schema endpoint requires a secret key (HTTP 401), so only public-key data/zero-row column probes were used to inspect existing columns. No secret key is used or requested for the app. The observed properties table still lacks user_id (confirmed by a zero-row probe). Local guest testing requires no backend change. Account persistence still requires verified ownership storage and reviewed RLS. No table or RLS policy has been changed; the database SQL files remain review-only.

## Navigation and property workspaces

There is one NavigationContainer and one styled bottom tab bar. Property opens the existing geographic map, Offers keeps the supplied screen, and the Profile icon opens the ORIGINAL My Properties design. The profile menu opens the ORIGINAL Edit Profile screen using the separate EditProfile stack route. Add Property uses the original multi-step form directly without a sign-in gate. Sign In/OTP remain optional menu actions. Full-screen forms/details/Edit Profile hide the tab bar and support normal Back navigation.

Guest submissions are saved using the existing AsyncStorage dependency under a separate @plotby/guest-test-properties:v1 key. They use guest-test: identifiers, user_id: null and storage_mode: guest-test. They stay on this device/browser origin, never enter the Supabase properties table, and are not promoted or merged when signing in. The My Properties banner and success popup identify this scope. Guest save/edit/delete and list refresh work without a database ownership migration. Guest geographic browsing shows only that device's test records with valid coordinates.

Signed-in reads verify the current user through the original Supabase client, filter the properties table by that verified id, and exclude local guest records. Account saves set the verified id, and account edits/deletes filter by both property id and owner. A failed validation of an existing session is shown as an error instead of silently saving it as guest data. Map/list/details clear cached rows on account changes and invalidate stale requests. Because no explicit public/published listing view exists in the supplied schema, the app does not perform the previous unscoped select of everyone's records, even on the map.

The original form validation, pricing, location picker, facing/contact/QR fields and success flow are retained. The runtime files changed for this request are JavaScript/JSX; unrelated TypeScript screens, assets and project configuration are retained. Existing navigation type metadata is updated to match the single My Properties tab and separate Edit Profile route.

See GUEST-MODE-CHANGES.md for exact files, verification results and remaining backend requirements.

## Supplied-source limitations

The primary archive did NOT contain working edit/delete navigation, persisted Profile fields, owner filtering, a payment processor, a property image uploader, or implemented saved-properties/Help actions. The integration supplies same-form edit, owner delete, auth metadata persistence, and owner filtering without changing database schema. It preserves existing image/QR controls; it does not invent an image storage backend. Existing record images, when stored in an images string array, are shown on details and mapped by the adapter. Property type is displayed when an existing property_type/type column is present; the original form's persisted field set was retained.

Offers remains the source's “coming soon” empty state; no offers backend was invented. Subscription keeps its source UI, with an explanatory payment alert because there is no payment handler in the input. Saved Properties and Help surface explicit messages instead of silent log-only actions. Avatar upload was not implemented in the primary source and remains unchanged. These source gaps are not claimed as fully implemented product features.

Android/iOS use the original react-native-maps implementation. Web now uses the platform-specific PropertyMap.web.tsx and a locally bundled Leaflet renderer, so native Fabric/codegen modules never load in the browser. The web location picker similarly uses SelectLocationOnMap.web.tsx instead of native WebView. Both platforms share the same Supabase records, carousel, list, city selector and map-style configuration.

For an existing installation, keep your own .env, replace the source and lockfile with this version, run `npm ci`, then `npx expo start --web --clear`. Avoid copying an old node_modules directory into the updated project. A successful JavaScript export alone does not establish browser runtime compatibility; the web repair was also exercised in a real browser.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform android
npx expo export --platform ios
```

See VERIFICATION.md for exact executed results and unverified device/backend checks. See CHANGES.md for the complete file inventory.

## Web map regression check

```sh
npx expo export --platform web
npm run test:web-bundle
```

The regression check fails if native map codegen symbols leak into the web bundle. Leaflet CSS and its small icon assets are bundled locally; no CDN script is needed. Its license is included under licenses/Leaflet-LICENSE. The same MapTiler environment key and styles are used as in the native map.
