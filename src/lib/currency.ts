// ---------------------------------------------------------------------------
// Currency formatting for AED
// ---------------------------------------------------------------------------

const formatter = new Intl.NumberFormat("en-AE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount as AED currency.
 *
 * Returns "AED —" for non-finite values (NaN, ±Infinity).
 *
 * @example formatCurrency(5000)  // "AED 5,000.00"
 * @example formatCurrency(0)     // "AED 0.00"
 * @example formatCurrency(NaN)   // "AED —"
 */
export function formatCurrency(amount: number): string {
  if (!isFinite(amount)) return "AED \u2014";
  return `AED ${formatter.format(amount)}`;
}
