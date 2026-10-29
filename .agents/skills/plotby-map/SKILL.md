---
name: plotby-map
description: Implement Plotby's react-native-maps property map, Maharashtra city selector, plot markers, and synchronized carousel.
---

# Plotby Map Standards

Use `react-native-maps` with Expo Go compatibility. Use configurable OpenStreetMap-compatible `UrlTile` imagery and preserve visible attribution. Do not use WebView, MapLibre Native, or a custom development build for this phase. On Android, acknowledge that the underlying Google Maps SDK may still be used even when OSM tiles are displayed.

The Property screen needs a searchable Maharashtra city selector, optional location permission, remembered city, interactive map, custom plot markers, a reserved horizontal-carousel area, and detail navigation.

Markers show total plot area in sqft and INR rate per sqft. Maintain one `selectedPlotId`: marker presses select the matching plot, carousel swipes will select the matching marker, and camera movement follows selection without feedback loops. Handle empty/invalid coordinates, stable IDs, clustering, visible-bounds queries, debounced map movement, memoized markers/cards, limited rendering, and preserved attribution.

Use Expo Go for validation and keep map components independent of Supabase with local sample data until the backend phase. Do not request location permission automatically.
