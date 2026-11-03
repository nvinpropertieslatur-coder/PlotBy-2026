import * as Location from 'expo-location';
import { resolveCityFromGeocode, MAHARASHTRA_CITIES } from './cities';
import type { MaharashtraCity } from './types';

export type LocationResult = { city: MaharashtraCity | null; reason?: 'permission-denied' | 'unavailable' | 'unresolved' };
export async function findCityFromCurrentLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) return { city: null, reason: 'permission-denied' };
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  if (!position?.coords) return { city: null, reason: 'unavailable' };
  const [address] = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
  return { city: resolveCityFromGeocode(address, MAHARASHTRA_CITIES), reason: resolveCityFromGeocode(address, MAHARASHTRA_CITIES) ? undefined : 'unresolved' };
}
