import type { MaharashtraCity } from './types';

// Coordinates are from Government of India's National Center for Seismology
// Maharashtra station records: https://riseq.seismo.gov.in/riseq/ob_network
export const MAHARASHTRA_CITIES: readonly MaharashtraCity[] = [
  { id: 'latur', name: 'Latur', district: 'Latur', state: 'Maharashtra', latitude: 18.41041667, longitude: 76.53328611 },
  { id: 'mumbai', name: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', latitude: 18.89753333, longitude: 72.81266389 },
  { id: 'nagpur', name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', latitude: 21.16989167, longitude: 79.05088611 },
  { id: 'nashik', name: 'Nashik', district: 'Nashik', state: 'Maharashtra', latitude: 20.0299, longitude: 73.7983 },
  { id: 'pune', name: 'Pune', district: 'Pune', state: 'Maharashtra', latitude: 18.52, longitude: 73.85 },
  { id: 'solapur', name: 'Solapur', district: 'Solapur', state: 'Maharashtra', latitude: 17.670282, longitude: 75.922909 },
  { id: 'kolhapur', name: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra', latitude: 16.67, longitude: 74.24 },
  { id: 'nanded', name: 'Nanded', district: 'Nanded', state: 'Maharashtra', latitude: 19.03, longitude: 73.17 },
  { id: 'chhatrapati-sambhajinagar', name: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', latitude: 19.87757, longitude: 75.34226 },
  { id: 'amravati', name: 'Amravati', district: 'Amravati', state: 'Maharashtra', latitude: 20.95, longitude: 77.78 },
  { id: 'satara', name: 'Satara', district: 'Satara', state: 'Maharashtra', latitude: 17.69, longitude: 74.03 },
  { id: 'thane', name: 'Thane', district: 'Thane', state: 'Maharashtra', latitude: 19.18, longitude: 72.98 },
];

export const DEFAULT_CITY = MAHARASHTRA_CITIES[0];

export function searchMaharashtraCities(query: string, cities = MAHARASHTRA_CITIES): MaharashtraCity[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [...cities];
  return cities.filter((city) => `${city.name} ${city.district}`.toLocaleLowerCase().includes(normalized));
}

export function resolveCityFromGeocode(address: { city?: string | null; district?: string | null; subregion?: string | null } | null, cities = MAHARASHTRA_CITIES): MaharashtraCity | null {
  if (!address) return null;
  const candidates = [address.city, address.district, address.subregion].filter(Boolean).map((value) => value!.toLocaleLowerCase());
  return cities.find((city) => candidates.some((candidate) => candidate === city.name.toLocaleLowerCase() || candidate === city.district.toLocaleLowerCase())) ?? null;
}
