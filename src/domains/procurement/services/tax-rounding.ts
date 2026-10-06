// Tax rounding rules: every local tax calculation MUST round per tax item with
// Math.round and derive totals from the sum of rounded values. Rounding the
// total instead (or not rounding at all) makes displayed rows diverge from the
// displayed total (e.g. 5.000 + 278 + 611 + 111 + 555 must total 6.555, not 6.554).

/** Round a single tax amount to whole rupiah (Math.round: .5 rounds up). */
export function roundTaxAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Round each tax amount and sum the rounded values.
 * Consumers computing tax from a rate should pass `Math.round(base * rate / 100)`
 * per item first (see PoTaxSection) — this helper then keeps that invariant
 * in one place for amount-based consumers (PurchaseOrderInvoiceSection).
 */
export function sumRoundedTaxAmounts(amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + Math.round(amount), 0);
}
