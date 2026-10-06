import type { ApiPaginatedResponse, ApiSuccessResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';

export type PickupOrderType = 'pickup' | 'deliver';
export type PickupOrderStatus = 'draft' | 'assigned' | 'completed' | 'cancelled';

export interface PickupOrderCompany {
  id: string;
  code: string;
  name: string;
}

export interface PickupOrderWarehouse {
  id: string;
  code: string;
  name: string;
}

export interface PickupOrderEmployee {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface PickupOrderDeliveryOrderSummary {
  id: string;
  code: string;
  status: string;
}

export interface PickupOrderSelectableDeliveryOrder {
  id: string;
  code: string;
  sourceType: string;
  status: string;
  sourceWarehouseName: string | null;
  destinationWarehouseName: string | null;
  items?: unknown[] | null;
}

export interface PickupOrderItemCatalog {
  id: string;
  code: string;
  name: string;
}

export interface PickupOrderResourceUnit {
  id: string;
  code: string;
  serialNumber?: string | null;
  name: string;
}

export interface PickupOrderItem {
  id: string;
  itemType: string;
  itemCatalog: PickupOrderItemCatalog | null;
  resourceUnit: PickupOrderResourceUnit | null;
  deliveryOrder: { id: string; code: string } | null;
  quantityPlanned: number;
  quantityActual: number | null;
  notes: string | null;
}

export interface PickupOrder {
  id: string;
  code: string;
  type: PickupOrderType;
  status: PickupOrderStatus;
  company: PickupOrderCompany;
  warehouse: PickupOrderWarehouse;
  assignedEmployee: PickupOrderEmployee | null;
  pickupLocation: string;
  scheduledDate: string;
  completedAt: string | null;
  cancelledReason: string | null;
  notes: string | null;
  deliveryOrders: PickupOrderDeliveryOrderSummary[];
  deliveryOrdersCount: number;
  items: PickupOrderItem[];
  itemsCount: number;
  createdBy: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupOrderListResponse extends ApiPaginatedResponse<PickupOrder[]> {}
export interface PickupOrderResponse extends ApiSuccessResponse<PickupOrder> {}

export interface CreatePickupOrderPayload {
  type: PickupOrderType;
  warehouseId: string;
  assignedToEmployeeId: string;
  pickupLocation: string;
  scheduledDate: string;
  deliveryOrderIds: string[];
  notes?: string | null;
}

export interface CompletePickupOrderPayload {
  completedAt?: string;
  notes?: string | null;
}

export interface CancelPickupOrderPayload {
  cancelledReason: string;
}

export interface ChangePickupOrderEmployeePayload {
  assignedToEmployeeId: string;
}

export interface GetPickupOrdersParams extends BaseQueryParams {
  companyId?: string;
  type?: PickupOrderType;
  status?: PickupOrderStatus;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetPickupOrderPickersParams {
  companyId?: string;
  search?: string;
  warehouseId?: string;
}
