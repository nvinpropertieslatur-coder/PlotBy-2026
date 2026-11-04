import type { Plot } from '../map/types';
export type PropertyRecord = Record<string, unknown> & { id: string | number };
const text = (value: unknown) => typeof value === 'string' ? value : '';
const numeric = (value: unknown): number | undefined => {
 if (value == null || typeof value === 'boolean' || (typeof value === 'string' && !value.trim())) return undefined;
 const result = Number(value); return Number.isFinite(result) ? result : undefined;
};
export function propertyToPlot(record: PropertyRecord): Plot | null {
 const latitude = numeric(record.latitude), longitude = numeric(record.longitude);
 if (latitude === undefined || longitude === undefined || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
 const facing = Array.isArray(record.facing) ? record.facing.filter((item): item is string => typeof item === 'string') : [];
 const images = Array.isArray(record.images) ? record.images.filter((item): item is string => typeof item === 'string') : [];
 const status = record.status;
 return { id: String(record.id), cityId: text(record.city).trim().toLowerCase().replace(/\s+/g, '-'), latitude, longitude,
 areaSqft: numeric(record.total_area) ?? 0, ratePerSqft: numeric(record.rate_per_sqft) ?? 0,
 finalAmount: numeric(record.total_amount), length: numeric(record.length), width: numeric(record.width),
 address: text(record.address), town: text(record.city), pincode: text(record.pincode), facing,
 primaryFacing: facing[0], imageUris: images, photoUri: images[0], contactName: text(record.agent_full_name),
 contactNumber: text(record.agent_contact_number), description: text(record.description),
 verified: record.verified === true || record.approved === true || record.status === 'verified',
 reraRegistered: record.maha_rera_registered === true,
 propertyType: text(record.property_type) || text(record.type) || 'Property',
 status: status === 'active' || status === 'sold' || status === 'inactive' || status === 'draft' ? status : undefined };
}
