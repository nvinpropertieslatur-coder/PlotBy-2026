import { View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { tileProvider } from '../browse/features/map/tileProvider';

type Props = { latitude?: number | null; longitude?: number | null };
export default function LocationMapPreview({ latitude, longitude }: Props) {
  if (latitude == null || longitude == null || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return <View style={{ height: 132, borderRadius: 14, backgroundColor: '#171a18', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' }} />;
  }
  const point = { latitude: Number(latitude), longitude: Number(longitude) };
  return (
    <View style={{ height: 156, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#8CFF32' }}>
      <MapView style={{ flex: 1 }} mapType={tileProvider ? 'none' : 'standard'} region={{ ...point, latitudeDelta: 0.008, longitudeDelta: 0.008 }}>
        {tileProvider && <UrlTile urlTemplate={tileProvider.urlTemplate} maximumZ={19} flipY={false} tileSize={256} />}
        <Marker coordinate={point} title="Land location" />
      </MapView>
    </View>
  );
}
