import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';

export interface LoadingOrderItemUom {
  id: string;
  name: string;
  code: string;
}

export interface LoadingOrderListItem {
  id: string;
  code: string;
  sourceType: 'allocation' | 'manual';
  status: string;
  company: { id: string; code: string; name: string };
  resourceAllocation: { id: string; code: string } | null;
  sourceWarehouse: { id: string; code: string; name: string };
  destinationWarehouse: { id: string; code: string; name: string };
  items: {
    id: string;
    itemType: string;
    itemCatalog: { id: string; code: string; name: string; uom: LoadingOrderItemUom | null } | null;
    resourceUnit: {
      id: string;
      code: string;
      name: string;
      serialNumber: string | null;
      uom: LoadingOrderItemUom | null;
    } | null;
    quantity: number;
    notes: string;
  }[];
  itemsCount: number;
  notes: string | null;
  preparedAt: string | null;
  preparedBy: { id: string; name: string } | null;
  loadedAt: string | null;
  loadedBy: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetLoadingOrdersParams extends BaseQueryParams {
  companyId?: string;
}

export type GetLoadingOrdersResponse = ApiPaginatedResponse<LoadingOrderListItem[]>;

export async function getLoadingOrders(
  params?: GetLoadingOrdersParams
): Promise<GetLoadingOrdersResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const { data } = await api.get<GetLoadingOrdersResponse>(
      getApiPath('/logistic/loading-orders'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<LoadingOrderListItem>(error, true);
  }
}
