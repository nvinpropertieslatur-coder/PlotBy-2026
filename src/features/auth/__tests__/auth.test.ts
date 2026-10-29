import { canEnterDevelopmentPreview, isValidIndianMobile, normalizeIndianMobile, toE164IndianMobile } from '../types';

describe('mobile identity validation', () => {
  it('accepts Indian mobile numbers and converts them to E.164', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(normalizeIndianMobile('+91 98765 43210')).toBe('9876543210');
    expect(toE164IndianMobile('9876543210')).toBe('+919876543210');
  });
  it('rejects short and invalid-prefix numbers', () => {
    expect(isValidIndianMobile('1234567890')).toBe(false);
    expect(isValidIndianMobile('98765')).toBe(false);
  });
  it('rejects preview entry while a real authenticated session exists', () => {
    expect(canEnterDevelopmentPreview(false)).toBe(true);
    expect(canEnterDevelopmentPreview(true)).toBe(false);
  });
});
