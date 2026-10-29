import { plotFormDefaults } from '../defaults';
import { getFirstInvalidStep, validatePlotForm } from '../validation';

describe('plot form validation', () => {
  it('reports the first invalid step for an empty form', () => {
    const validation = validatePlotForm(plotFormDefaults);
    expect(validation.isPublishReady).toBe(false);
    expect(validation.firstInvalidStep).toBe(0);
  });

  it('does not require hidden sanction fields when layout is not sanctioned', () => {
    const values = { ...plotFormDefaults, total_area_sqft: '1000', rate_per_sqft: '100', roadFacingSides: [{ direction: 'north' as const, widthFt: '30' }], full_address: 'Address', city_town: 'Latur', district: 'Latur', contact_name: 'Owner', contact_mobile: '9876543210', ownership_type: 'owner' as const };
    expect(validatePlotForm(values).result.success).toBe(true);
  });

  it('requires a valid cover reference when images exist', () => {
    const values = { ...plotFormDefaults, total_area_sqft: '1000', rate_per_sqft: '100', roadFacingSides: [{ direction: 'north' as const, widthFt: '30' }], full_address: 'Address', city_town: 'Latur', district: 'Latur', contact_name: 'Owner', contact_mobile: '9876543210', ownership_type: 'owner' as const, plot_images: [{ id: 'one', uri: 'file://one', order: 0 }], image_order: ['one'] };
    expect(validatePlotForm(values).result.success).toBe(false);
    expect(validatePlotForm({ ...values, cover_image: 'one' }).result.success).toBe(true);
  });

  it('maps schema errors to their wizard step', () => {
    expect(getFirstInvalidStep({ contact_name: { message: 'Required' } })).toBe(5);
  });
});
