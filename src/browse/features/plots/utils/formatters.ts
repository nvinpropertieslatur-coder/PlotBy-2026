import { formatPriceInLakhsCrores, formatRatePerSqft as formatRate } from '@/src/utils/priceFormatter';

export function formatINR(value?: number): string {
  return formatPriceInLakhsCrores(value, { fallback: 'Not provided' });
}
export function formatPlotArea(value?: number): string {
  return value == null || !Number.isFinite(value) ? 'Not provided' : `${value.toLocaleString('en-IN')} sqft`;
}
export function formatRatePerSqft(value?: number): string {
  return formatRate(value, 'Not provided');
}
