import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';

export type LoadingOrderSourceType = 'allocation' | 'manual';
export type LoadingOrderStatus = 'draft' | 'prepared' | 'loaded' | 'cancelled';
export type LoadingOrderItemType = 'material' | 'equipment';

export interface LoadingOrderCompany {
  id: string;
  code: string;
  name: string;
}

export interface LoadingOrderWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface LoadingOrderResourceAllocation {
  id: string;
  code: string;
}

export interface LoadingOrderEmployee {
  id: string;
  name: string;
}

export interface LoadingOrderItemCatalog {
  id: string;
  code: string;
  name: string;
}

export interface LoadingOrderResourceUnit {
  id: string;
  code: string;
  serialNumber?: string | null;
  name: string;
}

export interface LoadingOrderItem {
  id: string;
  itemType: LoadingOrderItemType | string;
  itemCatalog: LoadingOrderItemCatalog | null;
  resourceUnit: LoadingOrderResourceUnit | null;
  quantity: number;
  notes: string | null;
}

export interface LoadingOrder {
  id: string;
  code: string;
  sourceType: LoadingOrderSourceType;
  status: LoadingOrderStatus;
  company: LoadingOrderCompany;
  resourceAllocation: LoadingOrderResourceAllocation | null;
  sourceWarehouse: LoadingOrderWarehouse;
  destinationWarehouse: LoadingOrderWarehouse;
  items: LoadingOrderItem[];
  itemsCount: number;
  notes: string | null;
  preparedAt: string | null;
  preparedBy: LoadingOrderEmployee | null;
  loadedAt: string | null;
  loadedBy: LoadingOrderEmployee | null;
  createdBy: LoadingOrderEmployee;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoadingOrderListResponse extends ApiPaginatedResponse<LoadingOrder[]> {}
export interface LoadingOrderResponse extends ApiSuccessResponse<LoadingOrder> {}

export interface LoadingOrderAvailableMaterial {
  itemCatalogId: string;
  code: string;
  name: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface LoadingOrderAvailableEquipment {
  resourceUnitId: string;
  code: string;
  serialNumber: string | null;
  name: string;
  status: string;
}

export interface LoadingOrderSelectableAllocation {
  resourceAllocationId: string;
  code: string;
  allocationType: string;
  sourceWarehouse: LoadingOrderWarehouse;
  itemCatalog: LoadingOrderItemCatalog | null;
  resourceUnit: LoadingOrderResourceUnit | null;
  quantity: number;
}

export interface LoadingOrderManualItemPayload {
  itemCatalogId?: string;
  resourceUnitId?: string;
  quantity?: number;
  notes?: string | null;
}

export type CreateLoadingOrderPayload =
  | {
      sourceType: 'allocation';
      resourceAllocationId: string;
      destinationWarehouseId: string;
      notes?: string | null;
    }
  | {
      sourceType: 'manual';
      sourceWarehouseId: string;
      destinationWarehouseId: string;
      notes?: string | null;
      items: LoadingOrderManualItemPayload[];
    };

export interface UpdateLoadingOrderPayload {
  destinationWarehouseId?: string;
  notes?: string | null;
  items?: LoadingOrderManualItemPayload[];
}

export interface GetLoadingOrdersParams extends BaseQueryParams {
  companyId?: string;
  sourceType?: LoadingOrderSourceType;
  status?: LoadingOrderStatus;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetLoadingOrderPickersParams {
  companyId?: string;
  search?: string;
}
