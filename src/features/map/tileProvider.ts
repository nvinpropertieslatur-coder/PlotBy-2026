import { isRasterTileTemplate } from './styles/plotbyNeonNight';

export type TileProviderConfig = { id: 'maptiler'; urlTemplate: string; attribution: string };
const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY?.trim();
const configuredUrl = process.env.EXPO_PUBLIC_PLOTBY_TILE_URL?.trim();
export const tileProvider: TileProviderConfig | null = mapTilerKey ? { id: 'maptiler', urlTemplate: configuredUrl || `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${encodeURIComponent(mapTilerKey)}`, attribution: '© MapTiler © OpenStreetMap contributors' } : null;
const neonUrl = process.env.EXPO_PUBLIC_PLOTBY_NEON_TILE_URL?.trim();
const neonAttribution = process.env.EXPO_PUBLIC_PLOTBY_NEON_ATTRIBUTION?.trim();
export type MapStyleId = 'satellite' | 'streets' | 'basic' | 'dark' | 'neon-night';
export const mapStyles: readonly { id: MapStyleId; label: string; urlTemplate?: string; attribution?: string }[] = [
  { id: 'satellite', label: 'Satellite', urlTemplate: tileProvider?.urlTemplate },
  ...(['streets', 'basic', 'dark'] as const).map((id) => ({ id, label: id === 'streets' ? 'Streets' : id === 'basic' ? 'Basic' : 'Dark', urlTemplate: mapTilerKey ? `https://api.maptiler.com/maps/${id === 'streets' ? 'streets-v4' : id === 'basic' ? 'basic-v2' : 'darkmatter'}/256/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerKey)}` : undefined })),
  ...(neonUrl && neonAttribution && isRasterTileTemplate(neonUrl) ? [{ id: 'neon-night' as const, label: 'Neon Night', urlTemplate: neonUrl, attribution: neonAttribution }] : []),
];
export const tileProviderSetupMessage = 'Map tiles are not configured. Add EXPO_PUBLIC_MAPTILER_KEY to the app environment.';
