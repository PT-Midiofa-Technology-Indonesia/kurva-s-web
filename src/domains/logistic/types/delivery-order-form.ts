// === Delivery Order Form Types ===

// sourceType values — matches runtime literals used in constants/index.tsx and DeliveryOrderForm.tsx
export type DeliveryOrderSourceType = 'purchase_order' | 'transfer_warehouse' | 'other_source';

// === Purchase Order Source Item (payload) ===
export interface DeliveryOrderPurchaseOrderInput {
  purchaseOrderId: string;
  costAllocationPercentage: number;
  costAllocatedAmount: number;
  notes: string;
}

// === Loading Order (Transfer Warehouse) Source Item (payload) ===
export interface DeliveryOrderLoadingOrderInput {
  loadingOrderId: string;
  costAllocationPercentage: number;
  notes: string;
}

// === Item Source (direct items, payload) ===
export interface DeliveryOrderItemInput {
  itemType: 'material' | 'resource';
  itemCatalogId: string;
  quantity: number;
  notes: string;
}

// === Full Create/Edit Payload ===
// purchaseOrders/loadingOrders/items are only present when there is at least one entry —
// see toPayload() in DeliveryOrderForm.tsx.
export interface CreateDeliveryOrderPayload {
  sourceType: DeliveryOrderSourceType;
  sourceShippingType: 'vendor' | 'warehouse';
  sourceShippingId?: string | null;
  destinationWarehouseId: string;
  etd: string;
  eta: string;
  resi?: string;
  carrier?: string;
  shippingCost?: number | null;
  weight?: number | null;
  notes?: string;
  companyId: string;
  purchaseOrders?: DeliveryOrderPurchaseOrderInput[];
  loadingOrders?: DeliveryOrderLoadingOrderInput[];
  items?: DeliveryOrderItemInput[];
}
