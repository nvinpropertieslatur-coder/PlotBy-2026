export type MarkerZoomTier = 'far' | 'city' | 'neighborhood' | 'street';

/** Approximate Web Mercator zoom from horizontal span and viewport width in dp. */
export function markerTierForRegion(longitudeDelta: number, viewportWidth: number): MarkerZoomTier {
  if (!Number.isFinite(longitudeDelta) || longitudeDelta <= 0 || !Number.isFinite(viewportWidth) || viewportWidth <= 0) return 'city';
  const zoom = Math.log2((360 * viewportWidth) / (256 * longitudeDelta));
  if (zoom < 10) return 'far';
  if (zoom < 13) return 'city';
  if (zoom < 16) return 'neighborhood';
  return 'street';
}

export const markerScale: Record<Exclude<MarkerZoomTier, 'far'>, number> = { city: 0.75, neighborhood: 1, street: 1.15 };
