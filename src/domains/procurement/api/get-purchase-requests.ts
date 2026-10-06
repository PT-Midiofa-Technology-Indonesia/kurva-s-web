import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { PurchaseRequestItem } from '../types';

export interface GetPurchaseRequestsParams {
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

export type GetPurchaseRequestsResponse = ApiPaginatedResponse<PurchaseRequestItem[]>;

export async function getPurchaseRequests(
  params?: GetPurchaseRequestsParams
): Promise<GetPurchaseRequestsResponse> {
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

    const { data } = await api.get<ApiPaginatedResponse<PurchaseRequestItem[]>>(
      getApiPath('/procurement/purchase-requests'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<PurchaseRequestItem>(error, true);
  }
}
