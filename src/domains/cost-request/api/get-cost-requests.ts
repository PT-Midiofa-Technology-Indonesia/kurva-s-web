import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { CostRequest, CostRequestStatus, CostRequestType } from '../types';

export interface GetCostRequestsParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  requestType?: CostRequestType;
  status?: CostRequestStatus;
  projectId?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  companyId?: string;
}

export type GetCostRequestsResponse = ApiPaginatedResponse<CostRequest[]>;

export async function getCostRequests(
  params?: GetCostRequestsParams
): Promise<GetCostRequestsResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};

    const { data } = await api.get<GetCostRequestsResponse>(getApiPath('/cost-requests'), {
      params: queryParams,
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });

    return data;
  } catch (error: unknown) {
    return handleApiError<CostRequest>(error, true);
  }
}
