# Integration changes

propertyAppFolder remains the primary project. Expo SDK 57, React Native 0.86.3 and React 19.2.3 are retained. Expo selected SDK-compatible map/SVG/Reanimated/Worklets/haptics versions. Only the secondary map, geographic browsing, location selection, Offers and necessary visual primitives were imported. The secondary Profile, auth, forms, Supabase client, backend repository and sample records were not copied.

The explicit user request takes precedence over bundled AGENTS.md guidance that conflicts with retaining React Navigation.

Functional changes: a typed root stack plus three styled tabs; owner-filtered management; map record adapter/focus refresh; record details; original-form edit and owner deletion; auth metadata Profile save; repaired OTP landing route and form location-picker integration. No database schema or RLS changes.

## Modified primary files

- `.env`
- `.gitignore`
- `App.tsx`
- `app.config.js`
- `package-lock.json`
- `package.json`
- `src/components/SelectLocationOnMap.tsx`
- `src/lib/supabase.ts`
- `src/navigation/appnavigator.tsx`
- `src/screens/OTP/OTPScreen.tsx`
- `src/screens/OTP/SignInScreeen.tsx`
- `src/screens/forms/AddPropertyScreen.tsx`
- `src/screens/forms/LocationDetails.tsx`
- `src/screens/forms/contactDetails.tsx`
- `src/screens/forms/propertyDetails.tsx`
- `src/screens/property/MyPropertiesScreen.tsx`
- `src/screens/property/ProfileScreen.tsx`
- `src/screens/property/SubscriptionScreen.tsx`
- `src/services/propertyService.ts`
- `tsconfig.json`

## Added files

- `.env.example`
- `README.md`
- `VERIFICATION.md`
- `app.json`
- `licenses/PlotBy-2026-LICENSE`
- `src/browse/OffersScreen.tsx`
- `src/browse/PropertyDetailsScreen.tsx`
- `src/browse/PropertyScreen.tsx`
- `src/browse/components/ui/AppBadge.tsx`
- `src/browse/components/ui/AppBottomSheet.tsx`
- `src/browse/components/ui/AppButton.tsx`
- `src/browse/components/ui/AppCard.tsx`
- `src/browse/components/ui/AppEmptyState.tsx`
- `src/browse/components/ui/AppFormField.tsx`
- `src/browse/components/ui/AppHeader.tsx`
- `src/browse/components/ui/AppInput.tsx`
- `src/browse/components/ui/AppLoader.tsx`
- `src/browse/components/ui/AppSelect.tsx`
- `src/browse/components/ui/AppText.tsx`
- `src/browse/components/ui/index.ts`
- `src/browse/features/location/cities.ts`
- `src/browse/features/location/components/CitySelector.tsx`
- `src/browse/features/location/location.ts`
- `src/browse/features/location/storage.ts`
- `src/browse/features/location/types.ts`
- `src/browse/features/map/components/MapEmptyState.tsx`
- `src/browse/features/map/components/MapErrorState.tsx`
- `src/browse/features/map/components/MapLoadingState.tsx`
- `src/browse/features/map/components/PlotMarker.tsx`
- `src/browse/features/map/components/PropertyMap.tsx`
- `src/browse/features/map/components/index.ts`
- `src/browse/features/map/markerZoom.ts`
- `src/browse/features/map/styles/plotbyNeonNight.ts`
- `src/browse/features/map/tileProvider.ts`
- `src/browse/features/map/types.ts`
- `src/browse/features/plots/components/PlotCard.tsx`
- `src/browse/features/plots/components/PlotCarousel.tsx`
- `src/browse/features/plots/components/PlotWheelItem.tsx`
- `src/browse/features/plots/components/PropertyList.tsx`
- `src/browse/features/plots/components/carouselMath.ts`
- `src/browse/features/plots/hooks/index.ts`
- `src/browse/features/plots/propertyAdapter.ts`
- `src/browse/features/plots/selection.ts`
- `src/browse/features/plots/utils/formatters.ts`
- `src/browse/theme/colors.ts`
- `src/browse/theme/index.ts`
- `src/browse/theme/motion.ts`
- `src/browse/theme/radius.ts`
- `src/browse/theme/spacing.ts`
- `src/browse/theme/typography.ts`
- `src/navigation/MainTabs.tsx`
- `src/navigation/types.ts`
- `tests/integration.test.cjs`

## Removed

- `src/components/BottomNavV1.tsx`: obsolete primary bottom navigation. All old imports/render sites and handlers were removed.
- Dependency/cache directories from the supplied archive are not distributed; install from the lockfile.

## Browser runtime repair

- Added `src/browse/features/map/components/PropertyMap.web.tsx`, using the same map props/data and existing screen controls.
- Added shared browser map renderer `src/components/LeafletMap.web.tsx` with raster tiles, valid-coordinate markers, selection, pan/zoom, attribution and tile loading/error states.
- Added `src/components/SelectLocationOnMap.web.tsx`; original form and native location picker remain.
- Added locally bundled Leaflet CSS/assets and CSS TypeScript declarations.
- Added Leaflet runtime dependency and type definitions; updated package lock and license inventory.
- Added `scripts/check-web-bundle.cjs` and `npm run test:web-bundle` to detect accidental native map imports in browser exports.

## Property access repair

- Added typed property access errors, owner-column resolution and zero-row ownership readiness checks.
- Added RequirePropertyAccess around the original Add Property and My Properties screens; retained public geographic browsing.
- Added OTP return-route handling and a browser/native success notification helper; preserved existing edit route parameters.
- Restored native auth refresh on foreground and removed the deprecated core SafeAreaView import from the original location picker.
- Removed mandatory owner-column environment configuration. The default user_id requires the review-only additive database migration, because the inspected table currently has no ownership column.
- Added database/01-inspect-property-access.sql, database/02-add-property-owner.review.sql and PROPERTY-ACCESS-FIX.md. No live database changes were made.
- Expanded automated tests from 5 to 11 for auth, ownership, return navigation and safe-area import regressions.
