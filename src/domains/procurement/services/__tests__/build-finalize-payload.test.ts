import { describe, expect, it } from 'vitest';
import { buildFinalizePayload } from '../build-finalize-payload';

describe('buildFinalizePayload', () => {
  it('omits payment methods from finalize payload', () => {
    const result = buildFinalizePayload([
      {
        vendorId: 'vendor-1',
        vendorName: 'Vendor A',
        vendorAddress: 'Jl. Vendor',
        warehouseId: 'warehouse-1',
        warehouseName: 'Warehouse A',
        warehouseAddress: 'Jl. Warehouse',
        dueDate: '2026-08-29',
        paymentMethods: [
          {
            id: 'pm-1',
            order: 1,
            paymentTypeId: 'pt-1',
            paymentTypeCode: 'PT01',
            paymentTypeLabel: 'Transfer',
            amount: 100000,
            notes: 'should not be sent',
          },
        ],
        taxes: [],
        items: [
          {
            id: 'item-1',
            name: 'Bata Merah',
            volPo: 10,
            uom: 'biji',
            unitPrice: 1000,
            totalPrice: 10000,
          },
        ],
      },
    ]);

    expect(result).toEqual({
      pos: [
        {
          vendor_id: 'vendor-1',
          due_date: '2026-08-29',
          warehouse_id: 'warehouse-1',
          taxes: [],
          payment_methods: [],
        },
      ],
    });
  });
});
