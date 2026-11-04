const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { formatPriceInLakhsCrores, formatRatePerSqft } = require('../src/utils/priceFormatter.js');
const { isNetworkError } = require('../src/utils/networkUtils.js');

test('formatPriceInLakhsCrores formats prices in Indian real estate format according to prompt specifications', () => {
  // Exact user table examples:
  assert.equal(formatPriceInLakhsCrores(200000), '₹2 Lakh');
  assert.equal(formatPriceInLakhsCrores(500000), '₹5 Lakh');
  assert.equal(formatPriceInLakhsCrores(1500000), '₹15 Lakh');
  assert.equal(formatPriceInLakhsCrores(7500000), '₹75 Lakh');
  assert.equal(formatPriceInLakhsCrores(10000000), '₹1 Cr');
  assert.equal(formatPriceInLakhsCrores(20000000), '₹2 Cr');
  assert.equal(formatPriceInLakhsCrores(200000000), '₹20 Cr');

  // Additional examples from prompt:
  assert.equal(formatPriceInLakhsCrores(25000000), '₹2.5 Cr');
  assert.equal(formatPriceInLakhsCrores(7550000), '₹75.5 Lakh');
  assert.equal(formatPriceInLakhsCrores(12500000), '₹1.25 Cr');

  // Compact options:
  assert.equal(formatPriceInLakhsCrores(200000, { compact: true }), '₹2 L');
  assert.equal(formatPriceInLakhsCrores(10000000, { compact: true }), '₹1 Cr');

  // Edge cases: null, undefined, empty, non-numeric, zero
  assert.equal(formatPriceInLakhsCrores(null), 'Price unavailable');
  assert.equal(formatPriceInLakhsCrores(undefined), 'Price unavailable');
  assert.equal(formatPriceInLakhsCrores(''), 'Price unavailable');
  assert.equal(formatPriceInLakhsCrores('invalid'), 'Price unavailable');
  assert.equal(formatPriceInLakhsCrores(0), '₹0');

  // Rate per sqft kept separate from total price:
  assert.equal(formatRatePerSqft(1900), '₹1,900 / sq ft');
  assert.equal(formatRatePerSqft(null), 'Not provided');
});

test('isNetworkError correctly distinguishes connectivity failures from database/auth/server errors', () => {
  // True network errors
  assert.equal(isNetworkError(new TypeError('Network request failed')), true);
  assert.equal(isNetworkError(new Error('Failed to fetch')), true);
  assert.equal(isNetworkError(new Error('NetworkError when attempting to fetch resource')), true);
  assert.equal(isNetworkError(new Error('net::ERR_INTERNET_DISCONNECTED')), true);
  assert.equal(isNetworkError(new Error('getaddrinfo ENOTFOUND api.supabase.co')), true);
  assert.equal(isNetworkError(new Error('The Internet connection appears to be offline.')), true);

  // False: Supabase RLS / PostgreSQL / validation errors
  assert.equal(isNetworkError({ code: '42501', message: 'permission denied for table properties' }), false);
  assert.equal(isNetworkError({ code: '23505', message: 'duplicate key value violates unique constraint' }), false);
  assert.equal(isNetworkError({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }), false);
  assert.equal(isNetworkError({ code: 'AUTH_REQUIRED', message: 'Authentication required' }), false);
  assert.equal(isNetworkError({ code: 'OWNERSHIP_REQUIRED', message: 'Ownership column required' }), false);

  // False: HTTP status errors received from reachable server
  assert.equal(isNetworkError({ status: 400, message: 'Bad request' }), false);
  assert.equal(isNetworkError({ status: 401, message: 'Unauthorized' }), false);
  assert.equal(isNetworkError({ status: 403, message: 'Forbidden' }), false);
  assert.equal(isNetworkError({ status: 500, message: 'Internal Server Error' }), false);
});
