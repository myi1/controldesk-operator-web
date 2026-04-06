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
 * @example formatCurrency(5000) // "AED 5,000.00"
 */
export function formatCurrency(amount: number): string {
  return `AED ${formatter.format(amount)}`;
}
