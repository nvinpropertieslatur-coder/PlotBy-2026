import { plotFormDefaults } from '../defaults';
import { fieldsForStep, plotFormSteps } from '../steps';
import { plotFormSchema } from '../schema';
import { chooseCover, dedupeImages, removeImage, reorderImages } from '../image-utils';

describe('add plot form foundation', () => {
  it('starts with empty, non-user-entered defaults', () => {
    expect(plotFormDefaults.total_area_sqft).toBe('');
    expect(plotFormDefaults.rate_per_sqft).toBe('');
    expect(plotFormDefaults.discount_type).toBe('none');
    expect(plotFormDefaults.plot_images).toEqual([]);
  });
  it('defines seven ordered steps and relevant field groups', () => {
    expect(plotFormSteps).toHaveLength(7);
    expect(plotFormSteps[0].title).toBe('Dimensions & Pricing');
    expect(fieldsForStep(0)).toContain('total_area_sqft');
    expect(fieldsForStep(6)).toEqual([]);
  });
  it('validates the implemented dimensions fields', () => {
    const result = plotFormSchema.safeParse(plotFormDefaults);
    expect(result.success).toBe(false);
    expect(plotFormSchema.safeParse({ ...plotFormDefaults, total_area_sqft: '1500', rate_per_sqft: '2500', roadFacingSides: [{ direction: 'north', widthFt: '30' }], full_address: 'Ausa Road', city_town: 'Latur', district: 'Latur', contact_name: 'Plotby', contact_mobile: '9876543210', ownership_type: 'owner' }).success).toBe(true);
  });
  it('does not collect excluded sanction detail fields', () => {
    const base = { ...plotFormDefaults, total_area_sqft: '1500', rate_per_sqft: '2500', roadFacingSides: [{ direction: 'north' as const, widthFt: '30' }], full_address: 'Ausa Road', city_town: 'Latur', district: 'Latur', contact_name: 'Plotby', contact_mobile: '9876543210', ownership_type: 'owner' as const };
    expect(plotFormSchema.safeParse(base).success).toBe(true);
    expect(plotFormSchema.safeParse({ ...base, layout_sanctioned: true }).success).toBe(true);
  });
  it('allows nullable road widths and hides discount requirements for none', () => {
    const base = { ...plotFormDefaults, total_area_sqft: '1500', rate_per_sqft: '2500', roadFacingSides: [{ direction: 'north' as const, widthFt: '30' }], full_address: 'Ausa Road', city_town: 'Latur', district: 'Latur', contact_name: 'Plotby', contact_mobile: '9876543210', ownership_type: 'owner' as const };
    expect(plotFormSchema.safeParse(base).success).toBe(true);
    expect(plotFormSchema.safeParse({ ...base, discount_type: 'percentage' }).success).toBe(false);
  });
  it('supports image deduplication, reorder, removal, and cover replacement', () => {
    const first = { id: '1', uri: 'file://one', order: 0 }; const second = { id: '2', uri: 'file://two', order: 1 };
    expect(dedupeImages([first], [first, second]).map((image) => image.id)).toEqual(['1', '2']);
    expect(reorderImages([first, second], 0, 1).map((image) => image.id)).toEqual(['2', '1']);
    expect(removeImage([first, second], '1').coverId).toBe('2');
    expect(chooseCover([second], 'missing')).toBe('2');
  });
});
