// === Raw API types ===

export interface RawDeliveryOrderItemUom {
  id: string;
  name: string;
  code: string;
}

export interface RawDeliveryOrderItemCatalog {
  id: string;
  code: string;
  name: string;
  uom: RawDeliveryOrderItemUom | null;
}

export interface RawDeliveryOrderResourceUnit {
  id: string;
  code: string;
  name: string;
  serialNumber?: string | null;
  uom?: RawDeliveryOrderItemUom | null;
}

export interface RawDeliveryOrderItem {
  id: string;
  itemType: string;
  itemCatalog: RawDeliveryOrderItemCatalog | null;
  resourceUnit: RawDeliveryOrderResourceUnit | null;
  purchaseOrderItemId: string;
  quantity: number;
  notes: string | null;
}

export interface RawDeliveryOrderPurchaseOrder {
  id: string;
  purchaseOrderId: string;
  costAllocationPercentage: number;
  costAllocatedAmount: number;
  notes: string | null;
  purchaseOrder: {
    id: string;
    code: string;
  };
}

export interface RawDeliveryOrderLoadingOrder {
  id: string;
  loadingOrderId: string;
  costAllocationPercentage: number;
  costAllocatedAmount: number;
  notes: string | null;
  loadingOrder: {
    id: string;
    code: string;
  };
}

export interface RawDeliveryOrderDocumentFile {
  id: string;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  url: string;
  createdAt?: string;
}

export interface RawDeliveryOrderDocument {
  documentType: {
    id: string;
    code: string;
    name: string;
  };
  files: RawDeliveryOrderDocumentFile[];
}

export interface RawDeliveryOrder {
  id: string;
  code: string;
  sourceType: string;
  status: string;
  resi: string | null;
  carrier: string | null;
  etd: string;
  eta: string;
  shippingCost: number | null;
  weight: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    code: string;
    name: string;
  };
  sourceShippingType: string;
  sourceShipping: {
    type: string;
    id: string;
    code: string;
    name: string;
  } | null;
  sourceWarehouse: {
    id: string;
    code: string;
    name: string;
  } | null;
  destinationWarehouse: {
    id: string;
    code: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
  purchaseOrders: RawDeliveryOrderPurchaseOrder[];
  loadingOrders: RawDeliveryOrderLoadingOrder[];
  items: RawDeliveryOrderItem[];
  documents?: RawDeliveryOrderDocument[];
  itemsCount: number;
}

// === Mapped domain types ===

export interface DeliveryOrderWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface DeliveryOrderCompany {
  id: string;
  code: string;
  name: string;
}

export interface DeliveryOrderCreatedBy {
  id: string;
  name: string;
}

export interface DeliveryOrderItemUom {
  id: string;
  name: string;
  code: string;
}

export interface DeliveryOrderItemCatalog {
  id: string;
  code: string;
  name: string;
  uom: DeliveryOrderItemUom | null;
}

export interface DeliveryOrderResourceUnit {
  id: string;
  code: string;
  name: string;
  serialNumber: string | null;
  uom: DeliveryOrderItemUom | null;
}

export interface DeliveryOrderItem {
  id: string;
  itemType: string;
  itemCatalog: DeliveryOrderItemCatalog | null;
  resourceUnit: DeliveryOrderResourceUnit | null;
  purchaseOrderItemId: string | null;
  quantity: number;
  notes: string | null;
}

export interface DeliveryOrderLoadingOrder {
  id: string;
  loadingOrderId: string;
  costAllocationPercentage: number;
  costAllocatedAmount: number;
  notes: string | null;
  loadingOrder: { id: string; code: string };
}

export interface DeliveryOrderPurchaseOrder {
  id: string;
  purchaseOrderId: string;
  costAllocationPercentage: number;
  costAllocatedAmount: number;
  notes: string | null;
  purchaseOrder: { id: string; code: string };
}

export interface DeliveryOrderSourceShipping {
  type: string;
  id: string;
  code: string;
  name: string;
}

export interface DeliveryOrderDocumentFile {
  id: string;
  fileName: string;
  fileSize?: number | null;
  mimeType?: string | null;
  url: string;
  createdAt?: string;
}

export interface DeliveryOrderDocument {
  documentType: {
    id: string;
    code: string;
    name: string;
  };
  files: DeliveryOrderDocumentFile[];
}

export interface DeliveryOrder {
  id: string;
  code: string;
  sourceType: string;
  status: string;
  resi: string | null;
  carrier: string | null;
  etd: string;
  eta: string;
  shippingCost: number | null;
  weight: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: DeliveryOrderCompany | null;
  sourceShippingType: string;
  sourceShipping: DeliveryOrderSourceShipping | null;
  sourceWarehouse: DeliveryOrderWarehouse | null;
  destinationWarehouse: DeliveryOrderWarehouse | null;
  createdBy: DeliveryOrderCreatedBy | null;
  purchaseOrders: DeliveryOrderPurchaseOrder[];
  loadingOrders: DeliveryOrderLoadingOrder[];
  items: DeliveryOrderItem[];
  documents: DeliveryOrderDocument[];
  itemsCount: number;
}

export type DeliveryOrderType = 'do' | 'inbound' | 'outbond';

// === Mapper ===

export function mapDeliveryOrder(raw: RawDeliveryOrder): DeliveryOrder {
  return {
    ...raw,
    documents: (raw.documents ?? []).map((doc) => ({
      documentType: doc.documentType,
      files: doc.files ?? [],
    })),
    company: raw.company ?? null,
    createdBy: raw.createdBy ?? null,
    sourceShippingType: raw.sourceShippingType ?? 'vendor',
    sourceShipping: raw.sourceShipping ?? null,
    purchaseOrders: (raw.purchaseOrders ?? []).map((po) => ({
      ...po,
      purchaseOrder: po.purchaseOrder ?? { id: '', code: '' },
    })),
    loadingOrders: (raw.loadingOrders ?? []).map((lo) => ({
      ...lo,
      loadingOrder: lo.loadingOrder ?? { id: '', code: '' },
    })),
    items: (raw.items ?? []).map((item) => ({
      id: item.id,
      itemType: item.itemType,
      itemCatalog: item.itemCatalog
        ? {
            id: item.itemCatalog.id,
            code: item.itemCatalog.code,
            name: item.itemCatalog.name,
            uom: item.itemCatalog.uom ?? null,
          }
        : null,
      resourceUnit: item.resourceUnit
        ? {
            id: item.resourceUnit.id,
            code: item.resourceUnit.code,
            name: item.resourceUnit.name,
            serialNumber: item.resourceUnit.serialNumber ?? null,
            uom: item.resourceUnit.uom ?? null,
          }
        : null,
      purchaseOrderItemId: item.purchaseOrderItemId ?? null,
      quantity: item.quantity,
      notes: item.notes ?? null,
    })),
  };
}
