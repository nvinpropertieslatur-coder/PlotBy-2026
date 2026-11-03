/** Palette for authoring the external Neon Night map style. UrlTile displays pre-rendered images. */
export const plotbyNeonNight = {
  background: '#101419',
  land: '#171E25',
  highway: '#FF922B',
  majorRoad: '#16C8FF',
  smallRoad: '#FF59C7',
  minorLane: '#47566B',
  water: '#102D46',
  park: '#16382D',
  building: '#26313D',
  label: '#FFFFFF',
  secondaryLabel: '#B9C5D3',
} as const;

/** Require an HTTPS XYZ image template, rather than a vector style or TileJSON URL. */
export function isRasterTileTemplate(value: string): boolean {
  return /^https:\/\//i.test(value) && ['{z}', '{x}', '{y}'].every((part) => value.includes(part)) && /\.(png|jpe?g|webp)(?:\?|$)/i.test(value);
}
