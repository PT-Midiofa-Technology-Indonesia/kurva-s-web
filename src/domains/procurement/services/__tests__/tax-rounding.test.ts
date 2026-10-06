import { describe, expect, it } from 'vitest';
import { roundTaxAmount, sumRoundedTaxAmounts } from '../tax-rounding';

describe('procurement tax rounding', () => {
  it('rounds individual tax amounts with standard Math.round (.5 rounds up)', () => {
    expect(roundTaxAmount(277.5)).toBe(278);
    expect(roundTaxAmount(610.5)).toBe(611);
    expect(roundTaxAmount(111.0)).toBe(111);
    expect(roundTaxAmount(555.0)).toBe(555);
  });

  it('sums rounded tax amounts so row sum matches displayed total (Option 1)', () => {
    // 5.000 DPP + four taxes (277.5, 610.5, 111, 555)
    // Unrounded sum: 1554.0 -> total 6.554
    // Rounded rows: 278 + 611 + 111 + 555 = 1555 -> total 6.555
    const rawTaxes = [277.5, 610.5, 111.0, 555.0];
    const totalTax = sumRoundedTaxAmounts(rawTaxes);

    expect(totalTax).toBe(1555);

    const baseAmount = 5000;
    const grandTotal = baseAmount + totalTax;
    expect(grandTotal).toBe(6555);
  });

  it('handles rate-based calculation matching PoTaxSection', () => {
    const baseAmount = 5000;
    const rates = [5.55, 12.21];
    const computedTaxes = rates.map((rate) => Math.round((baseAmount * rate) / 100));
    const totalTax = sumRoundedTaxAmounts(computedTaxes);

    // 5000 * 5.55 / 100 = 277.5 -> 278
    // 5000 * 12.21 / 100 = 610.5 -> 611
    expect(computedTaxes).toEqual([278, 611]);
    expect(totalTax).toBe(889);
  });
});
