import { mapPlotRecord } from '../mapper';

describe('Supabase plot mapper', () => {
  it('maps normalized road sides into existing UI arrays', () => {
    const plot = mapPlotRecord({
      plot: { id: 'plot-1', owner_id: 'owner-1', property_type: 'plot', city_id: 'city-1', locality: 'Ausa Road', address: 'Address', town: 'Latur', taluka: 'Latur', district: 'Latur', state: 'Maharashtra', pincode: '413512', google_maps_url: null, latitude: 18.41, longitude: 76.53, area_sqft: 1800, width: 36, length: 50, primary_facing: 'West', rate_per_sqft: 2300, original_rate_per_sqft: 2500, base_amount: 4140000, discount_type: 'flat', discount_value: 150000, discount_amount: 150000, final_amount: 3990000, is_negotiable: true, na_type: 'Residential NA', layout_sanctioned: true, ownership_type: 'owner', description: 'Plot', search_keywords: ['road'], status: 'active', is_featured: false, published_at: '2026-10-28T00:00:00.000Z', contact_name: 'Owner', contact_phone: '9876543210', created_at: '2026-10-28T00:00:00.000Z', updated_at: '2026-10-28T00:00:00.000Z' },
      city: { id: 'city-1', name: 'Latur', state: 'Maharashtra', slug: 'latur', latitude: 18.41, longitude: 76.53, is_active: true, created_at: '2026-10-28T00:00:00.000Z' },
      roadSides: [{ id: 'road-2', plot_id: 'plot-1', direction: 'east', width_ft: 30, sort_order: 1, created_at: '2026-10-28T00:00:00.000Z' }, { id: 'road-1', plot_id: 'plot-1', direction: 'north', width_ft: 24, sort_order: 0, created_at: '2026-10-28T00:00:00.000Z' }],
      images: [{ id: 'image-1', plot_id: 'plot-1', storage_path: 'owner-1/plot-1/cover.jpg', sort_order: 0, is_cover: true, created_at: '2026-10-28T00:00:00.000Z' }],
      imageUrls: { 'owner-1/plot-1/cover.jpg': 'https://example.test/cover.jpg' },
    });
    expect(plot.cityId).toBe('latur');
    expect(plot.facing).toEqual(['north', 'east']);
    expect(plot.roadWidths).toEqual(['24 ft', '30 ft']);
    expect(plot.finalAmount).toBe(3990000);
    expect(plot.photoUri).toBe('https://example.test/cover.jpg');
  });
});
