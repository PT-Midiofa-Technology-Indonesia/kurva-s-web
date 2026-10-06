import { describe, expect, it } from 'vitest';
import type { PoDraftPo } from '../../types/api';
import { buildPoListFromFinalized } from '../StepFinalizeSection';

describe('buildPoListFromFinalized', () => {
  it('maps pos[index].taxes to preview taxes default value', () => {
    const rawPos: PoDraftPo[] = [
      {
        id: '01a0905a-01c5-70e6-b09b-4322442cf6f7',
        vendor: {
          id: '019fd5b1-bbbe-73a7-b19e-e67300c3b9b0',
          code: 'SUP-17726',
          name: 'PT Sumber Rejeki',
          address: 'Komplek Pergudangan Kamal Muara, Jakarta Utara',
        },
        dueDate: '2026-03-31',
        warehouseId: '01a073f8-6202-71c7-8ba7-ef37b6c7c8c3',
        warehouse: {
          id: '01a073f8-6202-71c7-8ba7-ef37b6c7c8c3',
          code: 'GUDANG-17734',
          name: 'Warehouse Utama',
        },
        paymentMethods: [],
        items: [
          {
            id: 'item-1',
            draftItemId: 'draft-item-1',
            purchaseRequestItemId: 'pr-item-1',
            catalogName: 'Paku 5cm',
            quantity: 100,
            uomCode: 'BOX',
            unitPrice: 15000,
            totalPrice: 1500000,
          },
        ],
        taxes: [
          {
            id: '01a0905a-01ef-73f9-821f-a9335ec18b44',
            tax_type_id: '01a0180f-82d0-7108-8aac-9a2cee5c557d',
            taxTypeId: '01a0180f-82d0-7108-8aac-9a2cee5c557d',
            name: 'PPh Pasal 21',
            code: 'PPH_21',
            rate: 2.5,
            taxRate: 2.5,
            amount: 37500,
            taxAmount: 37500,
            effect: 'DEDUCTION',
          },
        ],
        totalAmount: 1500000,
        createdAt: '2026-03-24T00:00:00Z',
        updatedAt: '2026-03-24T00:00:00Z',
      },
    ];

    const result = buildPoListFromFinalized(rawPos);

    expect(result[0].taxes).toEqual([
      {
        taxTypeId: '01a0180f-82d0-7108-8aac-9a2cee5c557d',
        taxTypeName: 'PPh Pasal 21',
        rate: 2.5,
        effect: 'DEDUCTION',
        amount: 37500,
      },
    ]);
    expect(result[0].costBreakdown).toBeNull();
  });

  it('preserves costBreakdown when present in finalized pos', () => {
    const rawPos: PoDraftPo[] = [
      {
        id: '01a0905a-01c5-70e6-b09b-4322442cf6f7',
        vendor: {
          id: 'v-1',
          code: 'SUP-01',
          name: 'Vendor One',
          address: null,
        },
        dueDate: '2026-03-31',
        warehouseId: null,
        warehouse: null,
        paymentMethods: [],
        items: [],
        taxes: [],
        costBreakdown: {
          title: 'RINCIAN NILAI',
          dpp: 15000,
          totalPayable: 14100,
          rows: [
            { label: 'DPP (Nilai Sebelum Pajak)', amount: 15000, effect: 'BASE' },
            { label: 'Pajak Pertambahan Nilai (11%)', amount: 1650, effect: 'ADDITION' },
            { label: 'PPh Pasal 21 (5%)', amount: 750, effect: 'DEDUCTION' },
          ],
        },
        totalAmount: 15000,
        createdAt: '2026-03-24T00:00:00Z',
        updatedAt: '2026-03-24T00:00:00Z',
      },
    ];

    const result = buildPoListFromFinalized(rawPos);
    expect(result[0].costBreakdown).toEqual(rawPos[0].costBreakdown);
  });

  it('handles empty or missing taxes gracefully', () => {
    const rawPos: PoDraftPo[] = [
      {
        id: '01a0905a-01c5-70e6-b09b-4322442cf6f8',
        vendor: {
          id: 'v-2',
          code: 'SUP-02',
          name: 'PT Vendor Dua',
          address: null,
        },
        dueDate: null,
        warehouseId: null,
        warehouse: null,
        paymentMethods: [],
        items: [],
        totalAmount: 0,
        createdAt: '2026-03-24T00:00:00Z',
        updatedAt: '2026-03-24T00:00:00Z',
      },
    ];

    const result = buildPoListFromFinalized(rawPos);
    expect(result[0].taxes).toEqual([]);
  });
});
