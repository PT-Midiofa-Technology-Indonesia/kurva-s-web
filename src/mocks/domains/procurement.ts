import { HttpResponse, http } from 'msw';
import type {
  GoodsReceiptDetail,
  GoodsReceiptListItem,
  SelectableDo,
  SelectableDoDetail,
} from '@/domains/procurement/types/goods-receipt';
import type { ApiPaginatedResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const goodsReceiptList: GoodsReceiptListItem[] = [
  {
    id: '019f4fd4-762f-70b2-81d1-d4bc9057752b',
    code: 'GR/WH-A/2026/0001',
    deliveryOrderId: '019f4fd4-762c-720e-af79-3e863f68fe5e',
    deliveryOrderCode: 'DO/WH01/2026/PB1U',
    companyId: '019efa2a-da52-712b-834e-031c85bdd1b2',
    destinationWarehouseId: '019f4f9e-1e93-71da-850b-99735626915b',
    destinationWarehouseName: 'Warehouse A',
    receivedAt: '2026-07-09T06:19:11+00:00',
    receivedAtFormatted: '09 Jul 2026 06:19 WIB',
    receivedBy: '019efa2a-ad50-730f-a472-c294d72bba4f',
    receivedByName: 'Admin',
    status: 'received',
    notes: 'Initial batch received safely.',
    sourceType: 'PO',
    purchaseOrderCode: 'PKJ-A/PO/2026/0001',
  },
];

const selectableDos: SelectableDo[] = [
  { id: '019f4fd4-7611-7022-b20b-457a40e5e4e1', code: 'DO/WH01/2026/STRB' },
  { id: '019f4fc0-12a9-7372-b608-46745eb17481', code: 'DO/WH01/2026/VC3V' },
  { id: '019f4fbf-e46d-7125-b4dc-eac1897dea98', code: 'DO/WH01/2026/L1E0' },
  { id: '019f4fbf-b573-72b1-8502-3ab214ab6335', code: 'DO/WH01/2026/I7V9' },
];

const selectableDoDetails: Record<string, SelectableDoDetail> = {
  '019f4fd4-7611-7022-b20b-457a40e5e4e1': {
    id: '019f4fd4-7611-7022-b20b-457a40e5e4e1',
    code: 'DO/WH01/2026/STRB',
    destinationWarehouseId: '019f4f9e-1e93-71da-850b-99735626915b',
    destinationWarehouseName: 'Warehouse A',
    sourceType: 'PO',
    purchaseOrderId: '019f3cc8-f521-72ce-844e-e133c32c6b63',
    purchaseOrderCode: 'PKJ-A/PO/2026/0001',
    items: [
      {
        delivery_order_item_id: '019f4fd4-7627-70f6-8e9a-d59fcc8309be',
        purchase_order_item_id: '019f3cc8-f52d-71b9-ba66-b0351990e1dd',
        item_catalog_id: '019f1385-7e5a-73ef-a4c9-a7fea2a302c2',
        resource_unit_id: null,
        code: 'MAT-BATA',
        name: 'Bata Merah ukuran 20x40',
        doQty: 50,
        uom: 'PCS',
      },
    ],
  },
};

const goodsReceiptDetails: Record<string, GoodsReceiptDetail> = {
  '019f4fd4-762f-70b2-81d1-d4bc9057752b': {
    id: '019f4fd4-762f-70b2-81d1-d4bc9057752b',
    code: 'GR/WH-A/2026/0001',
    deliveryOrderId: '019f4fd4-762c-720e-af79-3e863f68fe5e',
    deliveryOrderCode: 'DO/WH01/2026/PB1U',
    companyId: '019efa2a-da52-712b-834e-031c85bdd1b2',
    destinationWarehouseId: '019f4f9e-1e93-71da-850b-99735626915b',
    destinationWarehouseName: 'Warehouse A',
    receivedAt: '2026-07-09T06:19:11+00:00',
    receivedAtFormatted: '09 Jul 2026 06:19 WIB',
    receivedBy: '019efa2a-ad50-730f-a472-c294d72bba4f',
    receivedByName: 'Admin',
    status: 'received',
    notes: 'Initial batch received safely.',
    sourceType: 'PO',
    purchaseOrderCode: 'PKJ-A/PO/2026/0001',
    items: [
      {
        id: '019f4fd4-7638-70a5-9885-b14e649cbb41',
        goodsReceiptId: '019f4fd4-762f-70b2-81d1-d4bc9057752b',
        deliveryOrderItemId: '019f4fd4-7636-713d-8520-4f7ce63bea59',
        purchaseOrderItemId: '019f3cc8-f52d-71b9-ba66-b0351990e1dd',
        itemCatalogId: '019f1385-7e5a-73ef-a4c9-a7fea2a302c2',
        resourceUnitId: null,
        code: 'MAT-BATA',
        name: 'Bata Merah ukuran 20x40',
        doQty: 50,
        quantityReceived: 50,
        quantityRejected: 0,
        quantityNet: 50,
        uom: 'PCS',
        notes: 'All items passed quality checks',
      },
    ],
    documents: [
      {
        documentType: {
          id: '019f6a03-3fda-71c9-af91-e381f3a1cc5d',
          code: 'MOBILE_RECEIPT_PHOTO',
          name: 'Foto Penerimaan Barang',
        },
        files: [
          {
            id: '01a03254-0de8-7359-bfb2-bc77a1b387b5',
            fileName: 'IMG_20260811_134803_355.jpg',
            fileSize: 1377134,
            mimeType: 'image/jpeg',
            url: 'https://example.com/storage/goods_receipts/sample-receipt.jpg',
            createdAt: '2026-08-24T05:52:44.000000Z',
          },
        ],
      },
    ],
  },
};

function buildGoodsReceiptCreateResponse(): GoodsReceiptDetail {
  return {
    id: '019f4fdd-f25f-72a7-8919-fe5a1a7eff2b',
    code: 'GR/WH-A/2026/0002',
    deliveryOrderId: '019f4fd4-7611-7022-b20b-457a40e5e4e1',
    deliveryOrderCode: 'DO/WH01/2026/STRB',
    companyId: '019efa2a-da52-712b-834e-031c85bdd1b2',
    destinationWarehouseId: '019f4f9e-1e93-71da-850b-99735626915b',
    destinationWarehouseName: 'Warehouse A',
    receivedAt: '2026-07-11T12:00:00+00:00',
    receivedAtFormatted: '11 Jul 2026 12:00 WIB',
    receivedBy: '019efa2a-ad50-730f-a472-c294d72bba4f',
    receivedByName: 'Admin',
    status: 'received',
    notes: 'Penerimaan semen 50 zak',
    sourceType: 'PO',
    purchaseOrderCode: 'PKJ-A/PO/2026/0001',
    items: [
      {
        id: '019f4fdd-f269-71ac-b47d-982c0a8c0d3d',
        goodsReceiptId: '019f4fdd-f25f-72a7-8919-fe5a1a7eff2b',
        deliveryOrderItemId: '019f4fd4-7627-70f6-8e9a-d59fcc8309be',
        purchaseOrderItemId: '019f3cc8-f52d-71b9-ba66-b0351990e1dd',
        itemCatalogId: '019f1385-7e5a-73ef-a4c9-a7fea2a302c2',
        resourceUnitId: null,
        code: 'MAT-BATA',
        name: 'Bata Merah ukuran 20x40',
        doQty: 50,
        quantityReceived: 50,
        quantityRejected: 5,
        quantityNet: 45,
        uom: 'PCS',
        notes: '5 zak pecah di perjalanan',
      },
    ],
    documents: [
      {
        documentType: {
          id: '019f6a03-3fda-71c9-af91-e381f3a1cc5d',
          code: 'MOBILE_RECEIPT_PHOTO',
          name: 'Foto Penerimaan Barang',
        },
        files: [
          {
            id: '01a03254-0de8-7359-bfb2-bc77a1b387b5',
            fileName: 'IMG_20260811_134803_355.jpg',
            fileSize: 1377134,
            mimeType: 'image/jpeg',
            url: 'https://example.com/storage/goods_receipts/sample-receipt.jpg',
            createdAt: '2026-08-24T05:52:44.000000Z',
          },
        ],
      },
    ],
  };
}

function buildCostRowsResponse(_boqItemId: string) {
  return {
    success: true,
    message: 'Data berhasil diambil.',
    data: [
      {
        type: 'material_tool',
        label: 'Material & Tools',
        items: [
          {
            id: 'cost-row-1',
            costCategory: 'material_cost',
            catalogType: 'App\\Models\\ItemCatalog',
            catalogId: 'catalog-1',
            code: 'M.232',
            name: 'Bata Merah ukuran 20x40',
            uom: { id: 'uom-1', code: 'biji', name: 'biji' },
            volumeRab: 50,
            volumeCco: 50,
            volumeAct: 50,
            existingPrQty: 0,
            maxQty: 50,
          },
          {
            id: 'cost-row-2',
            costCategory: 'material_cost',
            catalogType: 'App\\Models\\ItemCatalog',
            catalogId: 'catalog-2',
            code: 'M.234',
            name: 'Semen 50 kg Merdeka',
            uom: { id: 'uom-2', code: 'sak', name: 'sak' },
            volumeRab: 2,
            volumeCco: 3,
            volumeAct: 3,
            existingPrQty: 1,
            maxQty: 2,
          },
        ],
      },
      {
        type: 'service_rental',
        label: 'Service & Rental',
        items: [
          {
            id: 'cost-row-3',
            costCategory: 'equipment_cost',
            catalogType: 'App\\Models\\ItemCatalog',
            catalogId: 'catalog-3',
            code: 'E.232',
            name: 'Crane',
            uom: { id: 'uom-3', code: 'Unit', name: 'Unit' },
            volumeRab: 2,
            volumeCco: 2,
            volumeAct: 2,
            existingPrQty: 0,
            maxQty: 2,
          },
          {
            id: 'cost-row-4',
            costCategory: 'manpower_cost',
            catalogType: 'App\\Models\\ItemCatalog',
            catalogId: 'catalog-4',
            code: 'P.234',
            name: 'Jasa Pengecatan Dinding',
            uom: { id: 'uom-4', code: 'orang', name: 'orang' },
            volumeRab: 0,
            volumeCco: 1,
            volumeAct: 1,
            existingPrQty: 1,
            maxQty: 0,
          },
        ],
      },
    ],
  };
}

export const procurementHandlers = [
  http.get(h('/procurement/purchase-requests/cost-rows/:boqItemId'), ({ params }) =>
    HttpResponse.json(buildCostRowsResponse(String(params.boqItemId)))
  ),
  http.post(h('/procurement/purchase-requests/manual'), () =>
    HttpResponse.json({
      success: true,
      message: 'Purchase Request berhasil ditambahkan',
      data: null,
    })
  ),
  http.post(h('/procurement/purchase-requests/bundle'), () =>
    HttpResponse.json({
      success: true,
      message: 'Purchase Request berhasil ditambahkan',
      data: null,
    })
  ),
  http.get(h('/procurement/goods-receipts'), ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const warehouseId = url.searchParams.get('warehouseId') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);

    const filtered = goodsReceiptList.filter((item) => {
      const matchesSearch =
        !search ||
        item.code.toLowerCase().includes(search) ||
        item.deliveryOrderCode.toLowerCase().includes(search);
      const matchesWarehouse = !warehouseId || item.destinationWarehouseId === warehouseId;
      return matchesSearch && matchesWarehouse;
    });

    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const data = filtered.slice(start, start + perPage);

    return HttpResponse.json<ApiPaginatedResponse<GoodsReceiptListItem[]>>({
      success: true,
      message: 'Data berhasil diambil.',
      data,
      meta: {
        currentPage: page,
        perPage,
        total,
        lastPage,
        from: total > 0 ? start + 1 : null,
        to: total > 0 ? Math.min(start + perPage, total) : null,
      },
      links: {
        first: h(`/procurement/goods-receipts?page=1`),
        last: h(`/procurement/goods-receipts?page=${lastPage}`),
        prev: page > 1 ? h(`/procurement/goods-receipts?page=${page - 1}`) : null,
        next: page < lastPage ? h(`/procurement/goods-receipts?page=${page + 1}`) : null,
      },
    });
  }),
  http.get(h('/procurement/goods-receipts/selectable-dos/:doId'), ({ params }) => {
    const detail = selectableDoDetails[String(params.doId)];
    if (!detail) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Delivery Order tidak ditemukan.',
          data: null,
          errorCode: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Data berhasil diambil.',
      data: detail,
    });
  }),
  http.get(h('/procurement/goods-receipts/selectable-dos'), () =>
    HttpResponse.json({
      success: true,
      message: 'Data berhasil diambil.',
      data: selectableDos,
    })
  ),
  http.post(h('/procurement/goods-receipts'), () =>
    HttpResponse.json({
      success: true,
      message: 'Goods Receipt berhasil disimpan.',
      data: buildGoodsReceiptCreateResponse(),
    })
  ),
  // Registered after the /selectable-dos routes above — MSW matches in
  // order, and `:id` would otherwise swallow those more specific paths.
  http.get(h('/procurement/goods-receipts/:id'), ({ params }) => {
    const id = String(params.id);
    const createResponse = buildGoodsReceiptCreateResponse();
    const detail = goodsReceiptDetails[id] ?? (id === createResponse.id ? createResponse : null);

    if (!detail) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Goods Receipt tidak ditemukan.',
          data: null,
          errorCode: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Data berhasil diambil.',
      data: detail,
    });
  }),
];
