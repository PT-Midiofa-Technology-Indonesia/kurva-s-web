import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ApprovalRequest } from '../types';

export interface GetApprovalRequestsParams extends BaseQueryParams {
  status?: string;
  companyId?: string;
}

export type GetApprovalRequestsResponse = ApiPaginatedResponse<ApprovalRequest[]>;

export async function getApprovalRequests(
  params?: GetApprovalRequestsParams
): Promise<GetApprovalRequestsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const { data } = await api.get<GetApprovalRequestsResponse>(getApiPath('/approval-requests'), {
      params,
      headers,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<ApprovalRequest>(error, true);
  }
}
