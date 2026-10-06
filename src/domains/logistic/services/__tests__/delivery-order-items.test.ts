import { describe, expect, it } from 'vitest';
import { aggregateItemsFromPOsAndLOs, toFormItem } from '../delivery-order-items';

describe('toFormItem', () => {
  it('maps a material item from its catalog', () => {
    const result = toFormItem({
      itemType: 'material',
      itemCatalog: { id: 'cat-1', code: 'BS', name: 'Besi', uom: { code: 'KG' } },
      resourceUnit: null,
      quantity: 5,
    });

    expect(result).toEqual({
      itemType: 'material',
      itemCatalogId: 'cat-1',
      resourceUnitId: '',
      itemCode: 'BS',
      itemName: 'Besi',
      uom: 'KG',
      quantity: 5,
    });
  });

  it('maps an equipment item from its resource unit', () => {
    const result = toFormItem({
      itemType: 'equipment',
      itemCatalog: null,
      resourceUnit: {
        id: 'unit-1',
        code: 'AD-001',
        name: 'Genset 20kVA',
        uom: { code: 'PCS' },
      },
      quantity: 1,
    });

    expect(result).toEqual({
      itemType: 'equipment',
      itemCatalogId: '',
      resourceUnitId: 'unit-1',
      itemCode: 'AD-001',
      itemName: 'Genset 20kVA',
      uom: 'PCS',
      quantity: 1,
    });
  });

  it('leaves uom empty when neither relation carries one', () => {
    const result = toFormItem({
      itemType: 'equipment',
      itemCatalog: null,
      resourceUnit: { id: 'unit-1', code: 'AD-001', name: 'Genset 20kVA' },
      quantity: 1,
    });

    expect(result.uom).toBe('');
  });

  it('defaults a missing itemType and quantity', () => {
    const result = toFormItem({ itemCatalog: null, resourceUnit: null });

    expect(result.itemType).toBe('material');
    expect(result.quantity).toBe(0);
  });
});

const materialItem = {
  itemType: 'material',
  itemCatalogId: 'cat-1',
  resourceUnitId: '',
  itemCode: 'BS',
  itemName: 'Besi',
  uom: 'KG',
  quantity: 10,
};

const genset = {
  itemType: 'equipment',
  itemCatalogId: '',
  resourceUnitId: 'unit-1',
  itemCode: 'AD-001',
  itemName: 'Genset 20kVA',
  uom: '',
  quantity: 1,
};

const excavator = {
  itemType: 'equipment',
  itemCatalogId: '',
  resourceUnitId: 'unit-2',
  itemCode: 'AD-002',
  itemName: 'Excavator',
  uom: '',
  quantity: 1,
};

describe('aggregateItemsFromPOsAndLOs', () => {
  it('returns an empty list when both sources are undefined', () => {
    expect(aggregateItemsFromPOsAndLOs(undefined, undefined)).toEqual([]);
  });

  it('sums the quantity of the same catalog item across orders', () => {
    const result = aggregateItemsFromPOsAndLOs(
      [{ items: [materialItem] }],
      [{ items: [{ ...materialItem, quantity: 5 }] }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(15);
  });

  it('keeps different equipment units as separate rows', () => {
    const result = aggregateItemsFromPOsAndLOs(undefined, [{ items: [genset, excavator] }]);

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.itemName)).toEqual(['Genset 20kVA', 'Excavator']);
  });

  it('sums the quantity of the same equipment unit across orders', () => {
    const result = aggregateItemsFromPOsAndLOs(undefined, [
      { items: [genset] },
      { items: [{ ...genset, quantity: 2 }] },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it('never merges items that carry no identifier', () => {
    const unidentified = { ...genset, resourceUnitId: '', itemCode: '', itemName: '' };
    const result = aggregateItemsFromPOsAndLOs(undefined, [
      { items: [unidentified, { ...unidentified, quantity: 4 }] },
    ]);

    expect(result).toHaveLength(2);
  });

  it('does not merge a catalog item with an equipment unit sharing the same id', () => {
    const result = aggregateItemsFromPOsAndLOs(undefined, [
      {
        items: [
          { ...materialItem, itemCatalogId: 'shared' },
          { ...genset, resourceUnitId: 'shared' },
        ],
      },
    ]);

    expect(result).toHaveLength(2);
  });

  it('ignores orders without an items list', () => {
    expect(aggregateItemsFromPOsAndLOs([{}], [{}])).toEqual([]);
  });
});
