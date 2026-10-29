import type { Plot, PlotRoadSide } from '@/src/features/map/types';
import type { Database } from '@/src/types/database';

type PlotRow = Database['public']['Tables']['plots']['Row'];
type PublicPlotRow = Database['public']['Views']['public_plots']['Row'];
type CityRow = Database['public']['Tables']['cities']['Row'];
type RoadRow = Database['public']['Tables']['plot_road_sides']['Row'];
type ImageRow = Database['public']['Tables']['plot_images']['Row'];

export type PlotRecord = { plot: PlotRow | PublicPlotRow; city: CityRow; roadSides: RoadRow[]; images: ImageRow[]; imageUrls?: Record<string, string> };

export function mapPlotRecord({ plot, city, roadSides, images, imageUrls = {} }: PlotRecord): Plot {
  const orderedRoads = [...roadSides].sort((a, b) => a.sort_order - b.sort_order);
  const mappedRoads: PlotRoadSide[] = orderedRoads.map((road) => ({ direction: road.direction, widthFt: Number(road.width_ft) }));
  const orderedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const cover = orderedImages.find((image) => image.is_cover) ?? orderedImages[0];
  return {
    id: plot.id,
    ownerId: 'owner_id' in plot ? plot.owner_id : undefined,
    cityId: city.slug,
    cityDatabaseId: city.id,
    district: plot.district ?? undefined,
    state: plot.state,
    taluka: plot.taluka ?? undefined,
    areaSqft: Number(plot.area_sqft),
    ratePerSqft: Number(plot.rate_per_sqft),
    latitude: plot.latitude == null ? Number.NaN : Number(plot.latitude),
    longitude: plot.longitude == null ? Number.NaN : Number(plot.longitude),
    photoUri: cover ? imageUrls[cover.storage_path] : undefined,
    imageUris: orderedImages.flatMap((image) => imageUrls[image.storage_path] ? [imageUrls[image.storage_path]] : []),
    facing: mappedRoads.map((road) => road.direction),
    primaryFacing: plot.primary_facing ?? undefined,
    locality: plot.locality ?? undefined,
    width: plot.width == null ? undefined : Number(plot.width),
    length: plot.length == null ? undefined : Number(plot.length),
    roadSides: mappedRoads,
    roadWidths: mappedRoads.map((road) => `${road.widthFt} ft`),
    originalRatePerSqft: plot.original_rate_per_sqft == null ? undefined : Number(plot.original_rate_per_sqft),
    discountType: plot.discount_type ?? undefined,
    discountValue: plot.discount_value == null ? undefined : Number(plot.discount_value),
    discountAmount: Number(plot.discount_amount),
    baseAmount: Number(plot.base_amount),
    finalAmount: Number(plot.final_amount),
    isNegotiable: plot.is_negotiable,
    naType: plot.na_type ?? undefined,
    layoutSanctioned: plot.layout_sanctioned ?? undefined,
    description: plot.description ?? undefined,
    address: plot.address,
    town: plot.town,
    pincode: plot.pincode ?? undefined,
    googleMapsUrl: plot.google_maps_url ?? undefined,
    searchKeywords: plot.search_keywords,
    contactName: 'contact_name' in plot ? plot.contact_name ?? undefined : undefined,
    contactNumber: 'contact_phone' in plot ? plot.contact_phone ?? undefined : undefined,
    ownershipType: plot.ownership_type ?? undefined,
    status: plot.status,
    publishedAt: plot.published_at ?? undefined,
    createdAt: plot.created_at,
    updatedAt: plot.updated_at,
  };
}
