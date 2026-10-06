import { describe, expect, it } from 'vitest';
import type { GoodsReceiptFormValues } from '../../schemas/goods-receipt';
import { buildGoodsReceiptPayload } from '../build-goods-receipt-payload';

const baseValues: GoodsReceiptFormValues = {
  deliveryOrderId: 'do-1',
  receivedAt: '2026-07-11',
  notes: 'Penerimaan semen 50 zak',
  items: [
    {
      deliveryOrderItemId: 'do-item-1',
      code: 'MAT-BATA',
      name: 'Bata Merah ukuran 20x40',
      doQty: 50,
      quantityReceived: 50,
      quantityRejected: 5,
      uom: 'PCS',
      notes: '5 zak pecah di perjalanan',
    },
  ],
};

describe('buildGoodsReceiptPayload', () => {
  it('maps form values to the snake_case create payload', () => {
    const result = buildGoodsReceiptPayload(baseValues);

    expect(result).toEqual({
      delivery_order_id: 'do-1',
      received_at: '2026-07-11 00:00:00',
      notes: 'Penerimaan semen 50 zak',
      items: [
        {
          delivery_order_item_id: 'do-item-1',
          quantity_received: 50,
          quantity_rejected: 5,
          notes: '5 zak pecah di perjalanan',
        },
      ],
    });
  });

  it('omits received_by from the payload (backend defaults to current user)', () => {
    const result = buildGoodsReceiptPayload(baseValues);

    expect(result).not.toHaveProperty('received_by');
  });

  it('omits empty per-item notes', () => {
    const result = buildGoodsReceiptPayload({
      ...baseValues,
      items: [{ ...baseValues.items[0], notes: '' }],
    });

    expect(result.items[0]).not.toHaveProperty('notes');
  });

  it('omits an empty header notes field', () => {
    const result = buildGoodsReceiptPayload({ ...baseValues, notes: '' });

    expect(result).not.toHaveProperty('notes');
  });

  it('defaults quantity_rejected to 0 when not provided', () => {
    const result = buildGoodsReceiptPayload({
      ...baseValues,
      items: [{ ...baseValues.items[0], quantityRejected: 0 }],
    });

    expect(result.items[0].quantity_rejected).toBe(0);
  });
});
