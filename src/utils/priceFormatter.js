/**
 * PlotBy Price Formatter
 * Formats property prices in Indian real estate notation (Lakhs and Crores).
 *
 * Rules:
 * | Stored amount | Display format |
 * | 200000        | ₹2 Lakh        |
 * | 500000        | ₹5 Lakh        |
 * | 1500000       | ₹15 Lakh       |
 * | 7500000       | ₹75 Lakh       |
 * | 10000000      | ₹1 Cr          |
 * | 20000000      | ₹2 Cr          |
 * | 200000000     | ₹20 Cr         |
 *
 * Additional examples:
 * - 25000000      -> ₹2.5 Cr
 * - 7550000       -> ₹75.5 Lakh
 * - 12500000      -> ₹1.25 Cr
 */

/**
 * Format a numeric amount into Indian real estate format (Lakhs / Crores).
 *
 * @param {number|string|null|undefined} value - Raw stored numeric amount
 * @param {object} [options]
 * @param {boolean} [options.compact] - Use 'L' instead of 'Lakh'
 * @param {string} [options.fallback] - Fallback text if invalid/null
 * @returns {string}
 */
export function formatPriceInLakhsCrores(value, options = {}) {
  const fallback = options.fallback ?? 'Price unavailable';

  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return fallback;
  }

  if (amount === 0) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const prefix = isNegative ? '-₹' : '₹';

  // 1 Crore = 10,000,000 (10^7)
  if (absAmount >= 10000000) {
    const crValue = absAmount / 10000000;
    // Format up to 2 decimal places and strip unnecessary trailing zeros
    const rounded = Number(crValue.toFixed(2));
    const formatted = rounded.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
    return `${prefix}${formatted} Cr`;
  }

  // 1 Lakh = 100,000 (10^5)
  if (absAmount >= 100000) {
    const lakhValue = absAmount / 100000;
    const rounded = Number(lakhValue.toFixed(2));
    const formatted = rounded.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
    const unit = options.compact ? 'L' : 'Lakh';
    return `${prefix}${formatted} ${unit}`;
  }

  // Amounts under 1 Lakh: standard Indian comma grouping
  return `${prefix}${Math.round(absAmount).toLocaleString('en-IN')}`;
}

/**
 * Format rate per square foot separately from total property price.
 *
 * @param {number|string|null|undefined} value
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatRatePerSqft(value, fallback = 'Not provided') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const rate = Number(value);
  if (!Number.isFinite(rate)) {
    return fallback;
  }

  return `₹${Math.round(rate).toLocaleString('en-IN')} / sq ft`;
}

export default formatPriceInLakhsCrores;
