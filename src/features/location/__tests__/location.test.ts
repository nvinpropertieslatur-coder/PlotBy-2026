import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { DEFAULT_CITY, searchMaharashtraCities, resolveCityFromGeocode } from '../cities';
import { loadSelectedCity, saveSelectedCity, SELECTED_CITY_STORAGE_KEY } from '../storage';
import { findCityFromCurrentLocation } from '../location';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

describe('Maharashtra city selector logic', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  it('searches city names and districts case-insensitively', () => {
    expect(searchMaharashtraCities('lAtUr')[0].id).toBe('latur');
    expect(searchMaharashtraCities('nashik')[0].district).toBe('Nashik');
  });

  it('resolves a supported city from reverse-geocode fields', () => {
    expect(resolveCityFromGeocode({ city: 'Latur', district: null, subregion: null })).toEqual(DEFAULT_CITY);
    expect(resolveCityFromGeocode({ city: 'Unknown', district: 'Unknown', subregion: null })).toBeNull();
  });

  it('persists and restores the selected city', async () => {
    await saveSelectedCity(DEFAULT_CITY);
    expect(await AsyncStorage.getItem(SELECTED_CITY_STORAGE_KEY)).toContain('Latur');
    expect(await loadSelectedCity()).toEqual(DEFAULT_CITY);
  });

  it('returns a permission-denied fallback without resolving a city', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: Location.PermissionStatus.DENIED, granted: false, canAskAgain: true, expires: 'never' });
    await expect(findCityFromCurrentLocation()).resolves.toEqual({ city: null, reason: 'permission-denied' });
  });
});
