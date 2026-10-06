import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { PurchaseOrderItem } from '../types/purchase-order';

export interface GetPurchaseOrdersParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  projectId?: string;
  type?: string;
  status?: string;
  companyId?: string;
}

export type GetPurchaseOrdersResponse = ApiPaginatedResponse<PurchaseOrderItem[]>;

export async function getPurchaseOrders(
  params?: GetPurchaseOrdersParams
): Promise<GetPurchaseOrdersResponse> {
  try {
    const queryParams: Record<string, unknown> = {};
    let companyId: string | undefined;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'companyId') {
          companyId = value as string;
          return;
        }
        queryParams[key] = value;
      });
    }

    const { data } = await api.get<ApiPaginatedResponse<PurchaseOrderItem[]>>(
      getApiPath('/procurement/purchase-orders'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<PurchaseOrderItem>(error, true);
  }
}
