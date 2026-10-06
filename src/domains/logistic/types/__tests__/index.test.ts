import { describe, expect, it } from 'vitest';
import { mapDeliveryOrder, type RawDeliveryOrder } from '../index';

const baseRaw: RawDeliveryOrder = {
  id: 'do-1',
  code: 'DO/GEN/2026/0001',
  sourceType: 'po',
  status: 'requested',
  resi: null,
  carrier: null,
  etd: '2026-08-28',
  eta: '2026-08-29',
  shippingCost: null,
  weight: null,
  notes: null,
  isActive: true,
  createdAt: '2026-08-28T00:00:00Z',
  updatedAt: '2026-08-28T00:00:00Z',
  company: { id: 'c-1', code: 'C', name: 'Company' },
  sourceShippingType: 'vendor',
  sourceShipping: null,
  sourceWarehouse: null,
  destinationWarehouse: null,
  createdBy: { id: 'u-1', name: 'User' },
  purchaseOrders: [],
  loadingOrders: [],
  items: [],
  itemsCount: 0,
};

describe('mapDeliveryOrder documents', () => {
  it('maps documents with their files', () => {
    const result = mapDeliveryOrder({
      ...baseRaw,
      documents: [
        {
          documentType: { id: 'dt-1', code: 'MOBILE_RECEIPT_PHOTO', name: 'Foto Penerimaan' },
          files: [
            {
              id: 'file-1',
              fileName: 'bukti-1.jpg',
              url: 'http://localhost/storage/bukti-1.jpg',
            },
          ],
        },
      ],
    });

    expect(result.documents).toEqual([
      {
        documentType: { id: 'dt-1', code: 'MOBILE_RECEIPT_PHOTO', name: 'Foto Penerimaan' },
        files: [
          {
            id: 'file-1',
            fileName: 'bukti-1.jpg',
            url: 'http://localhost/storage/bukti-1.jpg',
          },
        ],
      },
    ]);
  });

  it('defaults missing files array to empty', () => {
    const rawWithMissingFiles = {
      ...baseRaw,
      documents: [
        {
          documentType: { id: 'dt-1', code: 'MOBILE_RECEIPT_PHOTO', name: 'Foto Penerimaan' },
        },
      ],
    } as unknown as RawDeliveryOrder;

    const result = mapDeliveryOrder(rawWithMissingFiles);

    expect(result.documents).toEqual([
      {
        documentType: { id: 'dt-1', code: 'MOBILE_RECEIPT_PHOTO', name: 'Foto Penerimaan' },
        files: [],
      },
    ]);
  });

  it('returns empty documents when API omits the field', () => {
    expect(mapDeliveryOrder(baseRaw).documents).toEqual([]);
  });
});
