import type { User } from '@supabase/supabase-js';
import { requireSupabase } from '@/src/lib/supabase';
import type { Plot } from '@/src/features/map/types';
import type { PlotFormValues, PlotImageAsset } from '@/src/features/plots/form/types';
import { calculatePlotPricing } from '@/src/features/plots/form/pricing';
import { allowedPlotImageTypes, plotImageCountLimit, plotImageMaxBytes } from '@/src/features/plots/image-policy';
import type { Database, PlotStatus } from '@/src/types/database';
import { mapPlotRecord } from './mapper';
import { commitStagedReplacement } from './image-replacement';

type PlotRow = Database['public']['Tables']['plots']['Row'];
type PublicPlotRow = Database['public']['Views']['public_plots']['Row'];
type PlotInsert = Database['public']['Tables']['plots']['Insert'];
type CityRow = Database['public']['Tables']['cities']['Row'];
type ImageRow = Database['public']['Tables']['plot_images']['Row'];
type PageOptions = { limit?: number; offset?: number };

const allowedImageTypes = new Set<string>(allowedPlotImageTypes);

function optionalNumber(value: string): number | null { return value.trim() ? Number(value) : null; }
function cleanText(value: string): string | null { return value.trim() || null; }
function assertAuthenticated(user: User | null): asserts user is User { if (!user) throw new Error('A verified Plotby account is required.'); }

async function currentUser(): Promise<User> {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  assertAuthenticated(data.user);
  return data.user;
}

async function resolveCity(value: string): Promise<CityRow> {
  const client = requireSupabase();
  const normalized = value.trim().toLocaleLowerCase();
  const { data, error } = await client.from('cities').select('*').eq('is_active', true);
  if (error) throw error;
  const city = data.find((item) => item.slug === normalized || item.name.toLocaleLowerCase() === normalized);
  if (!city) throw new Error('Select a supported Maharashtra city.');
  return city;
}

function buildPlotInsert(values: PlotFormValues, ownerId: string, city: CityRow, status: PlotStatus): PlotInsert {
  const area = Number(values.total_area_sqft);
  const rate = Number(values.rate_per_sqft);
  const pricing = calculatePlotPricing(area, rate, values.discount_type, Number(values.discount_value || 0));
  return {
    owner_id: ownerId,
    property_type: 'plot',
    city_id: city.id,
    locality: cleanText(values.locality),
    address: values.full_address.trim(),
    town: values.city_town.trim(),
    taluka: cleanText(values.taluka),
    district: cleanText(values.district),
    state: values.state.trim() || 'Maharashtra',
    pincode: cleanText(values.pincode),
    google_maps_url: cleanText(values.google_maps_url),
    latitude: optionalNumber(values.latitude),
    longitude: optionalNumber(values.longitude),
    area_sqft: area,
    width: optionalNumber(values.width_ft),
    length: optionalNumber(values.length_ft),
    primary_facing: cleanText(values.primary_facing),
    rate_per_sqft: rate,
    original_rate_per_sqft: null,
    base_amount: pricing.baseAmount,
    discount_type: values.discount_type === 'none' ? null : values.discount_type,
    discount_value: values.discount_type === 'none' ? null : Number(values.discount_value),
    discount_amount: pricing.discountAmount,
    final_amount: pricing.finalAmount,
    is_negotiable: values.is_negotiable,
    na_type: cleanText(values.na_type),
    layout_sanctioned: values.layout_sanctioned,
    ownership_type: cleanText(values.ownership_type),
    description: cleanText(values.details),
    search_keywords: values.search_keywords.map((keyword) => keyword.trim()).filter(Boolean),
    status,
    published_at: status === 'active' ? new Date().toISOString() : null,
    contact_name: cleanText(values.contact_name),
    contact_phone: cleanText(values.contact_mobile),
  };
}

function assertImages(images: PlotImageAsset[]) {
  if (images.length > plotImageCountLimit) throw new Error(`Add no more than ${plotImageCountLimit} images.`);
  for (const image of images) {
    if (image.mimeType && !allowedImageTypes.has(image.mimeType)) throw new Error('Only JPEG, PNG, and WebP images are supported.');
    if (image.fileSize && image.fileSize > plotImageMaxBytes) throw new Error('Each image must be 10 MB or smaller.');
  }
}

async function stageImageObjects(ownerId: string, plotId: string, images: PlotImageAsset[], coverId: string, batch = `batch-${Date.now()}`): Promise<Database['public']['Tables']['plot_images']['Insert'][]> {
  assertImages(images);
  if (!images.length) return [];
  const client = requireSupabase();
  const uploadedPaths: string[] = [];
  try {
    const rows: Database['public']['Tables']['plot_images']['Insert'][] = [];
    for (const [index, image] of images.entries()) {
      const mime = image.mimeType || 'image/jpeg';
      const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const path = `${ownerId}/${plotId}/${batch}/${image.id}.${extension}`;
      const body = await (await fetch(image.uri)).arrayBuffer();
      if (body.byteLength > plotImageMaxBytes) throw new Error('Each image must be 10 MB or smaller.');
      const { error } = await client.storage.from('plot-images').upload(path, body, { contentType: mime, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      rows.push({ plot_id: plotId, storage_path: path, sort_order: index, is_cover: image.id === coverId });
    }
    return rows;
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from('plot-images').remove(uploadedPaths);
    throw error;
  }
}

async function insertImageRows(rows: Database['public']['Tables']['plot_images']['Insert'][]): Promise<ImageRow[]> {
  if (!rows.length) return [];
  const { data, error } = await requireSupabase().from('plot_images').insert(rows).select('*');
  if (error) throw error;
  return data;
}

async function hydratePlots(rows: (PlotRow | PublicPlotRow)[]): Promise<Plot[]> {
  if (!rows.length) return [];
  const client = requireSupabase();
  const plotIds = rows.map((row) => row.id);
  const cityIds = [...new Set(rows.map((row) => row.city_id))];
  const [{ data: cities, error: cityError }, { data: roads, error: roadError }, { data: images, error: imageError }] = await Promise.all([
    client.from('cities').select('*').in('id', cityIds),
    client.from('plot_road_sides').select('*').in('plot_id', plotIds).order('sort_order'),
    client.from('plot_images').select('*').in('plot_id', plotIds).order('sort_order'),
  ]);
  if (cityError) throw cityError;
  if (roadError) throw roadError;
  if (imageError) throw imageError;
  const paths = (images ?? []).map((image) => image.storage_path);
  const signed = paths.length ? await client.storage.from('plot-images').createSignedUrls(paths, 3600) : { data: [], error: null };
  if (signed.error) throw signed.error;
  const imageUrls = Object.fromEntries((signed.data ?? []).flatMap((item) => item.signedUrl ? [[item.path, item.signedUrl]] : []));
  return rows.flatMap((plot) => {
    const city = (cities ?? []).find((item) => item.id === plot.city_id);
    if (!city) return [];
    return [mapPlotRecord({ plot, city, roadSides: (roads ?? []).filter((road) => road.plot_id === plot.id), images: (images ?? []).filter((image) => image.plot_id === plot.id), imageUrls })];
  });
}

export async function createPlot(values: PlotFormValues, status: 'draft' | 'active' = 'draft'): Promise<Plot> {
  const client = requireSupabase();
  const user = await currentUser();
  const city = await resolveCity(values.city_town);
  const { data: row, error } = await client.from('plots').insert(buildPlotInsert(values, user.id, city, status)).select('*').single();
  if (error) throw error;
  try {
    const roads = values.roadFacingSides.map((road, index) => ({ plot_id: row.id, direction: road.direction, width_ft: Number(road.widthFt), sort_order: index }));
    if (roads.length) {
      const { error: roadError } = await client.from('plot_road_sides').insert(roads);
      if (roadError) throw roadError;
    }
    const imageRows = await stageImageObjects(user.id, row.id, values.plot_images, values.cover_image, 'initial');
    await insertImageRows(imageRows);
    return (await hydratePlots([row]))[0];
  } catch (creationError) {
    await client.from('plots').delete().eq('id', row.id);
    throw creationError;
  }
}

export async function updatePlot(id: string, values: PlotFormValues, status: 'draft' | 'active' = 'draft'): Promise<Plot> {
  const client = requireSupabase();
  const user = await currentUser();
  const city = await resolveCity(values.city_town);
  const update = buildPlotInsert(values, user.id, city, status);
  delete (update as Partial<PlotInsert>).owner_id;
  const roads = values.roadFacingSides.map((road, index) => ({ plot_id: id, direction: road.direction, width_ft: Number(road.widthFt), sort_order: index }));
  const { data: oldImages, error: oldImageError } = await client.from('plot_images').select('storage_path').eq('plot_id', id);
  if (oldImageError) throw oldImageError;
  let row: PlotRow | undefined;
  await commitStagedReplacement({
    stage: () => stageImageObjects(user.id, id, values.plot_images, values.cover_image),
    commit: async (imageRows) => {
      const { data, error } = await client.rpc('update_plot_with_relations', {
        target_plot_id: id,
        plot_values: update,
        road_values: roads,
        image_values: imageRows,
      });
      if (error) throw error;
      row = data;
    },
    removeStaged: async (imageRows) => { if (imageRows.length) await client.storage.from('plot-images').remove(imageRows.map((image) => image.storage_path)); },
    removeOld: async () => { if (oldImages.length) { const { error } = await client.storage.from('plot-images').remove(oldImages.map((image) => image.storage_path)); if (error) throw error; } },
  });
  if (!row) throw new Error('Plot update did not return a row.');
  return (await hydratePlots([row]))[0];
}

export async function deletePlot(id: string): Promise<void> {
  const client = requireSupabase();
  await currentUser();
  const { data: images, error: imageError } = await client.from('plot_images').select('storage_path').eq('plot_id', id);
  if (imageError) throw imageError;
  if (images.length) {
    const { error: storageError } = await client.storage.from('plot-images').remove(images.map((image) => image.storage_path));
    if (storageError) throw storageError;
  }
  const { error } = await client.from('plots').delete().eq('id', id);
  if (error) throw error;
}

export async function getPlotById(id: string): Promise<Plot | null> {
  const client = requireSupabase();
  const { data: sessionData } = await client.auth.getSession();
  if (sessionData.session) {
    const owned = await client.from('plots').select('*').eq('id', id).maybeSingle();
    if (owned.error) throw owned.error;
    if (owned.data) return (await hydratePlots([owned.data]))[0] ?? null;
  }
  const { data, error } = await client.from('public_plots').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? (await hydratePlots([data]))[0] ?? null : null;
}

export async function getPlotsByCity(citySlug: string, options: PageOptions = {}): Promise<Plot[]> {
  const client = requireSupabase();
  const city = await resolveCity(citySlug);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const offset = Math.max(0, options.offset ?? 0);
  const { data, error } = await client.from('public_plots').select('*').eq('city_id', city.id).order('published_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return hydratePlots(data);
}

export async function getMyPlots(options: PageOptions = {}): Promise<Plot[]> {
  const client = requireSupabase();
  const user = await currentUser();
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const offset = Math.max(0, options.offset ?? 0);
  const { data, error } = await client.from('plots').select('*').eq('owner_id', user.id).order('updated_at', { ascending: false }).range(offset, offset + limit - 1);
  if (error) throw error;
  return hydratePlots(data);
}
