import { useMemo } from 'react';
import { View } from 'react-native';
import { LeafletMap } from '@/src/components/LeafletMap.web';
import type { MaharashtraCity } from '../../location/types';
import { isValidPlot, type Plot } from '../types';
import { tileProvider, tileProviderSetupMessage } from '../tileProvider';
import { MapErrorState } from './MapErrorState';
import { MapEmptyState } from './MapEmptyState';

export function PropertyMap({ city, selectedPlotId, onSelectPlot, plots = [], tileUrl = tileProvider?.urlTemplate, attribution = tileProvider?.attribution, mapPadding }: {
  city: MaharashtraCity; selectedPlotId?: string; onSelectPlot: (id: string) => void;
  plots?: readonly Plot[]; tileUrl?: string; attribution?: string;
  mapPadding?: { top: number; bottom: number; left: number; right: number };
}) {
  const valid = useMemo(() => plots.filter(isValidPlot), [plots]);
  const selected = valid.find(plot => plot.id === selectedPlotId);
  const markers = useMemo(() => valid.map(plot => ({ id: plot.id, latitude: plot.latitude, longitude: plot.longitude, label: `₹${(plot.finalAmount ?? plot.areaSqft * plot.ratePerSqft).toLocaleString('en-IN')}` })), [valid]);
  if (!tileUrl) return <MapErrorState message={tileProviderSetupMessage} />;
  return <View style={{ flex: 1, overflow: 'hidden' }}>
    <LeafletMap latitude={selected?.latitude ?? city.latitude} longitude={selected?.longitude ?? city.longitude} zoom={selected ? 16 : 12}
      markers={markers} selectedId={selectedPlotId} onSelect={onSelectPlot} tileUrl={tileUrl}
      attribution={attribution ?? '© MapTiler © OpenStreetMap contributors'} bottomInset={mapPadding?.bottom} />
    {!valid.length && <View pointerEvents="none" style={{ position: 'absolute', alignSelf: 'center', top: '40%', padding: 12, backgroundColor: '#1C211C', borderRadius: 12 }}><MapEmptyState /></View>}
  </View>;
}
