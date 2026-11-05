import type { PropertyRecord } from '../plots/propertyAdapter';

import { agricultureDetails, agricultureOptionKeys, type AgricultureOption } from './options';

export type Range = { min: string; max: string };
export type AgricultureFilters = {
  query: string;
  city: string;
  state: string;
  town: string;
  latitude: string;
  longitude: string;
  radiusKm: number;
  nearby: { latitude: number; longitude: number; radiusKm: number } | null;
  area: Range;
  guntha: Range;
  options: Record<AgricultureOption, string[]>;
  discountAvailable: boolean;
  perAcre: Range;
  total: Range;
  discount: string[];
};

export const emptyRange: Range = { min: '', max: '' };
export const emptyAgricultureFilters: AgricultureFilters = {
  query: '', city: '', state: '', town: '', latitude: '', longitude: '', radiusKm: 10, nearby: null,
  area: emptyRange, guntha: emptyRange, discountAvailable: false,
  options: { roadAccess: [], landType: [], waterSource: [] },
  perAcre: emptyRange, total: emptyRange, discount: [],
};

export const areaFactors = { Acre: 43560, Gunta: 1089 };
export const radii = [5, 10, 25, 50];
export const discountOptions = [
  { id: 'none', label: 'No discount', min: 0, max: 0 },
  { id: 'under10', label: 'Under 10%', min: 0, max: 10 },
  { id: '10to20', label: '10–20%', min: 10, max: 20 },
  { id: '20plus', label: '20% and above', min: 20, max: Infinity },
];

const normalize = (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : '';
export function isAgriculture(record: PropertyRecord) {
  const type = normalize(record.property_type || record.type).replace(/[\s_-]/g, '');
  return type === 'agriculturalland';
}

export function numberField(value: unknown): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export const hasRange = (range: Range) => Boolean(range.min || range.max);
export function validRange(range: Range) {
  const min = numberField(range.min), max = numberField(range.max);
  return (!range.min || (min !== undefined && min >= 0)) &&
    (!range.max || (max !== undefined && max >= (min ?? 0)));
}

export function perAcreRate(record: PropertyRecord) {
  const rate = numberField(record.rate_per_sqft);
  if (rate === undefined) return undefined;
  return numberField(rate * areaFactors.Acre);
}

function inRange(value: number | undefined, range: Range, factor = 1) {
  if (!hasRange(range)) return true;
  return value !== undefined && value >= (numberField(range.min) ?? 0) * factor &&
    value <= (numberField(range.max) ?? Infinity) * factor;
}

export function discountPercent(record: PropertyRecord) {
  if (record.discount === false) return 0;
  if (record.discount !== true) return undefined;
  const base = (numberField(record.total_area) ?? 0) * (numberField(record.rate_per_sqft) ?? 0);
  const total = numberField(record.total_amount);
  if (base <= 0 || total === undefined || total < 0 || total > base) return undefined;
  return Math.round((1 - total / base) * 10000) / 100;
}

export function discountBucket(record: PropertyRecord) {
  const percent = discountPercent(record);
  if (percent === undefined) return undefined;
  return discountOptions.find(option => option.id === 'none' ? percent === 0 :
    percent > 0 && percent >= option.min && percent < option.max)?.id;
}

function nearby(record: PropertyRecord, center: NonNullable<AgricultureFilters['nearby']>) {
  const latitude = numberField(record.latitude), longitude = numberField(record.longitude);
  if (latitude === undefined || longitude === undefined || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return false;
  const radians = Math.PI / 180;
  const a = Math.sin((latitude - center.latitude) * radians / 2) ** 2 +
    Math.cos(center.latitude * radians) * Math.cos(latitude * radians) *
    Math.sin((longitude - center.longitude) * radians / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, a))) <= center.radiusKm;
}

export function coordinateCenter(filters: AgricultureFilters) {
  const latitude = numberField(filters.latitude), longitude = numberField(filters.longitude);
  if (latitude === undefined || longitude === undefined || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude, radiusKm: filters.radiusKm };
}

export function matchesAgriculture(record: PropertyRecord, filters: AgricultureFilters) {
  const query = normalize(filters.query);
  const details = agricultureDetails(record.agriculture_details);
  const center = coordinateCenter(filters) ?? filters.nearby;
  const area = numberField(record.total_area);
  const contains = (value: string, search: string) => normalize(value).includes(normalize(search));
  return (!query || [record.address, record.city, record.pincode].some(value => normalize(value).includes(query))) &&
    (!normalize(filters.city) || normalize(record.city) === normalize(filters.city)) &&
    contains(details.state, filters.state) && contains(details.town, filters.town) &&
    (!center || nearby(record, center)) &&
    agricultureOptionKeys.every(key => !filters.options[key].length ||
      filters.options[key].some(option => details[key].includes(option))) &&
    inRange(area, filters.area, areaFactors.Acre) &&
    inRange(area, filters.guntha, areaFactors.Gunta) &&
    inRange(perAcreRate(record), filters.perAcre) &&
    inRange(numberField(record.total_amount), filters.total) &&
    (!filters.discountAvailable || record.discount === true) &&
    (!filters.discount.length || filters.discount.includes(discountBucket(record) ?? ''));
}

export function selectedAgricultureFilters(filters: AgricultureFilters) {
  const rangeLabel = (range: Range) => range.min && range.max ? `${range.min}–${range.max}` : range.min ? `≥ ${range.min}` : `≤ ${range.max}`;
  return [
    { label: filters.query.trim(), patch: { query: '' } },
    { label: filters.city.trim(), patch: { city: '' } },
    { label: filters.state.trim(), patch: { state: '' } },
    { label: filters.town.trim(), patch: { town: '' } },
    { label: filters.latitude || filters.longitude ? `Within ${filters.radiusKm} km of coordinates` : '',
      patch: { latitude: '', longitude: '' } },
    { label: filters.nearby ? `Within ${filters.nearby.radiusKm} km` : '', patch: { nearby: null } },
    { label: hasRange(filters.area) ? `${rangeLabel(filters.area)} acres` : '', patch: { area: emptyRange } },
    { label: hasRange(filters.guntha) ? `${rangeLabel(filters.guntha)} guntha` : '', patch: { guntha: emptyRange } },
    { label: filters.discountAvailable ? 'Discount available' : '', patch: { discountAvailable: false } },
    ...agricultureOptionKeys.flatMap(key => filters.options[key].map(label => ({
      label, patch: { options: { ...filters.options, [key]: filters.options[key].filter(option => option !== label) } },
    }))),
    { label: hasRange(filters.perAcre) ? `₹ ${rangeLabel(filters.perAcre)} / acre` : '', patch: { perAcre: emptyRange } },
    { label: hasRange(filters.total) ? `₹ ${rangeLabel(filters.total)} total` : '', patch: { total: emptyRange } },
    ...discountOptions.filter(option => filters.discount.includes(option.id)).map(option => ({
      label: option.label, patch: { discount: filters.discount.filter(id => id !== option.id) },
    })),
  ].filter(item => item.label);
}
