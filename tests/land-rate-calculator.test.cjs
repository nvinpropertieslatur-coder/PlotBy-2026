const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLandRate, validateLandRate } = require('../src/screens/forms/landRateCalculator');

test('converts guntha to acres and calculates fixed discounts', () => {
  const result = calculateLandRate({ acres: 1, guntha: 20, ratePerAcre: 400000, discount: 10000, discountType: 'fixed' });
  assert.deepEqual(result, { totalAcre: 1.5, totalGuntha: 60, basicPrice: 600000, discountAmount: 10000, finalPrice: 590000 });
});

test('applies percentage discount and handles empty values as zero', () => {
  assert.equal(calculateLandRate({ acres: 2, guntha: 0, ratePerAcre: 500000, discount: 10, discountType: 'percentage' }).finalPrice, 900000);
  assert.equal(calculateLandRate({}).finalPrice, 0);
});

test('rejects negative values and discounts greater than the basic price', () => {
  assert.ok(validateLandRate({ acres: -1 }));
  assert.ok(validateLandRate({ acres: 1, ratePerAcre: 100, discount: 101 }));
  assert.equal(validateLandRate({ acres: 1, ratePerAcre: 100, discount: 100 }), null);
});
