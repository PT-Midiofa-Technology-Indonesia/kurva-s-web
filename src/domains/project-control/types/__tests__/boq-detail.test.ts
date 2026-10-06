import { describe, expect, it } from 'vitest';
import { mapToBOQDetailRows } from '../boq-detail';

describe('mapToBOQDetailRows', () => {
  it('maps totalAmountCco and totalAmountActual onto amountCco/amountActual', () => {
    const rows = mapToBOQDetailRows([
      {
        id: 'item-1',
        code: 'A.1.1.1',
        name: 'Pengerjaan Dinding',
        isFinalLevel: true,
        totalAmountRab: '1000000',
        totalAmountCco: '500000',
        totalAmountActual: '250000',
        children: [],
      },
    ]);

    expect(rows[0].amountRab).toBe(1000000);
    expect(rows[0].amountCco).toBe(500000);
    expect(rows[0].amountActual).toBe(250000);
  });

  it('maps missing amount fields to null', () => {
    const rows = mapToBOQDetailRows([
      { id: 'item-2', code: 'A.1.1.2', name: 'Pemasangan Granit', children: [] },
    ]);

    expect(rows[0].amountRab).toBeNull();
    expect(rows[0].amountCco).toBeNull();
    expect(rows[0].amountActual).toBeNull();
  });
});
