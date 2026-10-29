import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile, type Region } from 'react-native-maps';
import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import type { MaharashtraCity } from '@/src/features/location/types';
import { SAMPLE_PLOTS } from '../samplePlots';
import { isValidPlot, type Plot } from '../types';
import { tileProvider, tileProviderSetupMessage } from '../tileProvider';
import { MapEmptyState } from './MapEmptyState';
import { MapErrorState } from './MapErrorState';
import { MapLoadingState } from './MapLoadingState';
import { PlotMarker } from './PlotMarker';
import { markerTierForRegion, type MarkerZoomTier } from '../markerZoom';

const DEFAULT_DELTA = 0.12;
const StableTiles = memo(function StableTiles({ url }: { url: string }) {
  return <UrlTile urlTemplate={url} maximumZ={19} flipY={false} tileSize={256} zIndex={0} />;
});
const ResponsiveMarker = memo(function ResponsiveMarker({ plot, selected, tier, onSelectPlot }: { plot: Plot; selected: boolean; tier: MarkerZoomTier; onSelectPlot: (id: string) => void }) {
  const [tracking, setTracking] = useState(true);
  useEffect(() => {
    const enable = setTimeout(() => setTracking(true), 0);
    const disable = setTimeout(() => setTracking(false), 300);
    return () => { clearTimeout(enable); clearTimeout(disable); };
  }, [selected, tier]);
  return <Marker coordinate={{ latitude: plot.latitude, longitude: plot.longitude }} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={tracking} onPress={() => onSelectPlot(plot.id)}><PlotMarker plot={plot} selected={selected} tier={tier} onPress={() => onSelectPlot(plot.id)} /></Marker>;
});
export function PropertyMap({ city, selectedPlotId, onSelectPlot, plots = SAMPLE_PLOTS, tileUrl = tileProvider?.urlTemplate, attribution = tileProvider?.attribution, mapPadding }: { city: MaharashtraCity; selectedPlotId?: string; onSelectPlot: (plotId: string) => void; plots?: readonly Plot[]; tileUrl?: string; attribution?: string; mapPadding?: { top: number; bottom: number; left: number; right: number } }) {
  const mapRef = useRef<MapView>(null); const lastTarget = useRef<string | undefined>(undefined); const animationStartedAt = useRef(0); const [ready, setReady] = useState(false); const validPlots = useMemo(() => plots.filter(isValidPlot), [plots]);
  const viewportWidth = useRef(0); const lastRegion = useRef<Region | null>(null); const [tier, setTier] = useState<MarkerZoomTier>('city');
  const updateTier = useCallback((region: Region) => { lastRegion.current = region; if (viewportWidth.current > 0) { const next = markerTierForRegion(region.longitudeDelta, viewportWidth.current); setTier((current) => current === next ? current : next); } }, []);
  const regionForCity = useCallback((target: MaharashtraCity): Region => ({ latitude: target.latitude, longitude: target.longitude, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA }), []);
  useEffect(() => {
    if (!ready) return;
    const plot = validPlots.find((item) => item.id === selectedPlotId);
    const target = plot ? `plot:${city.id}:${plot.id}:${plot.latitude}:${plot.longitude}` : `city:${city.id}:${city.latitude}:${city.longitude}`;
    if (target === lastTarget.current) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      if (!plot) { lastTarget.current = target; animationStartedAt.current = Date.now(); map.animateToRegion(regionForCity(city), 550); return; }
      void map.getCamera().catch(() => null).then((camera) => {
        if (cancelled || mapRef.current !== map) return;
        lastTarget.current = target;
        animationStartedAt.current = Date.now();
        const zoom = typeof camera?.zoom === 'number' && Number.isFinite(camera.zoom) ? Math.max(camera.zoom, 16) : 16;
        map.animateCamera({ center: { latitude: plot.latitude, longitude: plot.longitude }, zoom }, { duration: 550 });
      });
    }, Math.max(200, 550 - (Date.now() - animationStartedAt.current)));
    return () => { cancelled = true; clearTimeout(timer); };
  }, [city, ready, regionForCity, selectedPlotId, validPlots]);
  if (!tileUrl) return <View style={styles.state}><MapErrorState message={tileProviderSetupMessage} /></View>;
  return <View style={styles.container} onLayout={(event) => { viewportWidth.current = event.nativeEvent.layout.width; if (lastRegion.current) updateTier(lastRegion.current); }}><MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={regionForCity(city)} mapType="none" mapPadding={mapPadding} onMapReady={() => setReady(true)} onRegionChangeComplete={updateTier}><StableTiles url={tileUrl} />{validPlots.map((plot) => <ResponsiveMarker key={plot.id} plot={plot} selected={plot.id === selectedPlotId} tier={tier} onSelectPlot={onSelectPlot} />)}</MapView>{!validPlots.length && ready && <View pointerEvents="none" style={styles.empty}><MapEmptyState /></View>}<View pointerEvents="none" style={styles.attribution}><AppText variant="caption">{attribution ?? 'Map attribution unavailable'}</AppText></View>{!ready && <View style={styles.overlay}><MapLoadingState /></View>}</View>;
}
const styles = StyleSheet.create({ container: { flex: 1, overflow: 'hidden', backgroundColor: colors.surface }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, empty: { position: 'absolute', alignSelf: 'center', top: '40%', padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12 }, attribution: { position: 'absolute', bottom: spacing.sm, right: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, backgroundColor: 'rgba(16,19,16,0.82)', borderRadius: 6 } });
