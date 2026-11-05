import { View } from 'react-native';
import { LeafletMap } from './LeafletMap.web';
import { tileProvider } from '../browse/features/map/tileProvider';
import { colors } from '../browse/theme';

type Props = { latitude?: number | null; longitude?: number | null };
export default function LocationMapPreview({ latitude, longitude }: Props) {
  const valid = latitude != null && longitude != null && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  if (!valid || !tileProvider) return <View style={{ height: 132, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }} />;
  return (
    <View style={{ height: 156, borderRadius: 14, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: colors.primary }}>
      <LeafletMap latitude={Number(latitude)} longitude={Number(longitude)} zoom={14} markers={[{ id: 'land-location', latitude: Number(latitude), longitude: Number(longitude), label: 'Land location' }]} selectedId="land-location" tileUrl={tileProvider.urlTemplate} attribution={tileProvider.attribution} />
    </View>
  );
}
