import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MaharashtraCity } from './types';
const KEY = '@plotby/selected-city';
export async function loadSelectedCity(): Promise<MaharashtraCity | null> { const value = await AsyncStorage.getItem(KEY); return value ? JSON.parse(value) as MaharashtraCity : null; }
export async function saveSelectedCity(city: MaharashtraCity): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify(city)); }
export { KEY as SELECTED_CITY_STORAGE_KEY };
