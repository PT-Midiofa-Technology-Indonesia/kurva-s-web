// ── List (GET /goods-receipts) ────────────────────────────────────────────
export interface GoodsReceiptListItem {
  id: string;
  code: string;
  deliveryOrderId: string;
  deliveryOrderCode: string;
  companyId: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  receivedAt: string;
  receivedAtFormatted: string;
  receivedBy: string;
  receivedByName: string;
  status: string;
  notes: string | null;
  sourceType: string;
  purchaseOrderCode: string | null;
}

// ── GET /goods-receipts/selectable-dos ──────────────────────────────────────
export interface SelectableDo {
  id: string;
  code: string;
}

// ── GET /goods-receipts/selectable-dos/{doId} ───────────────────────────────
export interface SelectableDoItem {
  delivery_order_item_id: string;
  purchase_order_item_id: string | null;
  item_catalog_id: string | null;
  resource_unit_id: string | null;
  code: string;
  name: string;
  doQty: number;
  uom: string;
}

export interface SelectableDoDetail {
  id: string;
  code: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  sourceType: string;
  purchaseOrderId: string | null;
  purchaseOrderCode: string | null;
  items: SelectableDoItem[];
}

// ── POST /goods-receipts (request body) ─────────────────────────────────────
export interface CreateGoodsReceiptItemPayload {
  delivery_order_item_id: string;
  quantity_received: number;
  quantity_rejected?: number;
  notes?: string;
}

export interface CreateGoodsReceiptPayload {
  delivery_order_id: string;
  received_at?: string;
  received_by?: string | null;
  notes?: string;
  items: CreateGoodsReceiptItemPayload[];
}

// ── POST /goods-receipts (response) & detail ────────────────────────────────
export interface GoodsReceiptDetailItem {
  id: string;
  goodsReceiptId: string;
  deliveryOrderItemId: string;
  purchaseOrderItemId: string | null;
  itemCatalogId: string | null;
  resourceUnitId: string | null;
  code: string;
  name: string;
  doQty: number;
  quantityReceived: number;
  quantityRejected: number;
  quantityNet: number;
  uom: string;
  notes: string | null;
}

// ── GET /goods-receipts/{id} → documents ────────────────────────────────────
export interface GoodsReceiptDocumentFile {
  id: string;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  url: string;
  createdAt?: string;
}

export interface GoodsReceiptDocument {
  documentType: {
    id: string;
    code: string;
    name: string;
  };
  files: GoodsReceiptDocumentFile[];
}

export interface GoodsReceiptDetail {
  id: string;
  code: string;
  deliveryOrderId: string;
  deliveryOrderCode: string;
  companyId: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  receivedAt: string;
  receivedAtFormatted: string;
  receivedBy: string;
  receivedByName: string;
  status: string;
  notes: string | null;
  sourceType: string;
  purchaseOrderCode: string | null;
  items?: GoodsReceiptDetailItem[];
  documents?: GoodsReceiptDocument[];
}
