import { HttpResponse, http } from 'msw';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const createDummyDO = (overrides?: Partial<Record<string, unknown>>) => ({
  id: 'do-1',
  code: 'DO/GEN/2026/0001',
  sourceType: 'purchase_order',
  status: 'requested',
  resi: 'AABBCC',
  carrier: 'JNE',
  etd: '2026-07-17T00:00:00+00:00',
  eta: '2026-07-20T00:00:00+00:00',
  shippingCost: 50000,
  weight: 1,
  notes: 'notes',
  isActive: true,
  createdAt: '2026-07-11T14:55:33+00:00',
  updatedAt: '2026-07-11T14:55:33+00:00',
  company: { id: 'comp-1', code: 'COMWIW', name: 'PT. Curva 4' },
  sourceWarehouse: null,
  destinationWarehouse: {
    id: 'wh-1',
    code: 'WH-MAIN',
    name: 'Warehouse A (Gudang Utama)',
  },
  createdBy: { id: 'user-1', name: 'Admin' },
  purchaseOrders: [
    {
      id: 'po-do-1',
      purchaseOrderId: 'po-1',
      costAllocationPercentage: 50,
      costAllocatedAmount: 25000,
      notes: 'notes',
      purchaseOrder: { id: 'po-1', code: 'PKJ-A/PO/2026/0001' },
    },
  ],
  items: [
    {
      id: 'item-1',
      itemType: 'material',
      itemCatalog: {
        id: 'cat-1',
        code: 'MAT-BATA',
        name: 'Bata Merah ukuran 20x40',
        uom: { id: 'uom-1', name: 'Pieces', code: 'PCS' },
      },
      resourceUnit: null,
      purchaseOrderItemId: 'poi-1',
      quantity: 50,
      notes: 'Merek Tiga Roda',
    },
  ],
  documents: [
    {
      documentType: {
        id: 'dt-1',
        code: 'MOBILE_RECEIPT_PHOTO',
        name: 'Foto Penerimaan Barang',
      },
      files: [
        {
          id: 'file-1',
          fileName: 'bukti-1.jpg',
          fileSize: 248896,
          mimeType: 'image/jpeg',
          url: 'http://localhost/storage/bukti-1.jpg',
          createdAt: '2026-08-28T15:19:29.000000Z',
        },
      ],
    },
  ],
  itemsCount: 1,
  ...overrides,
});

export const logisticHandlers = [
  // List delivery orders
  http.get(h('/logistic/delivery-orders'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    return HttpResponse.json<ApiPaginatedResponse>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: [createDummyDO()],
        meta: {
          currentPage: page,
          perPage,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: {
          first: h(`/logistic/delivery-orders?page=1&perPage=${perPage}`),
          last: h(`/logistic/delivery-orders?page=1&perPage=${perPage}`),
          prev: null,
          next: null,
        },
      },
      { status: 200 }
    );
  }),

  // Detail delivery order
  http.get(h('/logistic/delivery-orders/:id'), () => {
    return HttpResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Data berhasil diambil.',
        data: createDummyDO(),
      },
      { status: 200 }
    );
  }),

  // Delete purchase order from delivery order
  http.delete(h('/logistic/delivery-orders/:doId/purchase-orders/:poId'), () => {
    return HttpResponse.json(
      { success: true, message: 'Purchase order berhasil dihapus.' },
      { status: 200 }
    );
  }),
];
