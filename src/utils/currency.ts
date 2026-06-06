/**
 * Formats a numeric value as Indian Rupees format (e.g. ₹1,20,000)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/**
 * Formats a currency value to shorthand notation (e.g. ₹1.2L or ₹12K)
 */
export function formatCurrencyShort(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  const val = Math.round(amount);
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)}Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}K`;
  }
  return `₹${val}`;
}
