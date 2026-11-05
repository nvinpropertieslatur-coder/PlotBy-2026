/** Land pricing uses integer paise internally to avoid floating point currency drift. */
export function calculateLandRate({ acres = 0, guntha = 0, ratePerAcre = 0, discount = 0, discountType = 'fixed' }) {
  const acreValue = Number(acres) || 0;
  const gunthaValue = Number(guntha) || 0;
  const rateValue = Number(ratePerAcre) || 0;
  const totalAcre = acreValue + gunthaValue / 40;
  const basicPricePaise = Math.round(totalAcre * rateValue * 100);
  const enteredDiscountPaise = Math.round((Number(discount) || 0) * 100);
  const discountPaise = discountType === 'percentage'
    ? Math.round(basicPricePaise * Math.min(100, Math.max(0, Number(discount) || 0)) / 100)
    : Math.min(basicPricePaise, enteredDiscountPaise);
  const totalGuntha = Math.round(totalAcre * 40 * 100) / 100;
  return {
    totalAcre: Math.round(totalAcre * 10000) / 10000,
    totalGuntha,
    basicPrice: basicPricePaise / 100,
    discountAmount: discountPaise / 100,
    finalPrice: (basicPricePaise - discountPaise) / 100,
  };
}

export function validateLandRate({ acres = 0, guntha = 0, ratePerAcre = 0, discount = 0, discountType = 'fixed' }) {
  const values = [acres, guntha, ratePerAcre, discount].map(Number);
  if (values.some(value => !Number.isFinite(value) || value < 0)) return 'Area, rate, and discount cannot be negative.';
  const result = calculateLandRate({ acres, guntha, ratePerAcre, discount, discountType });
  if (discountType === 'fixed' && Number(discount) > result.basicPrice) return 'Discount cannot exceed the basic land price.';
  if (discountType === 'percentage' && Number(discount) > 100) return 'Discount cannot exceed 100%.';
  return null;
}
