export function formatINR(value?: number): string { return value == null || !Number.isFinite(value) ? 'Not provided' : `₹${Math.round(value).toLocaleString('en-IN')}`; }
export function formatPlotArea(value?: number): string { return value == null || !Number.isFinite(value) ? 'Not provided' : `${value.toLocaleString('en-IN')} sqft`; }
export function formatRatePerSqft(value?: number): string { return value == null || !Number.isFinite(value) ? 'Not provided' : `${formatINR(value)}/sqft`; }
