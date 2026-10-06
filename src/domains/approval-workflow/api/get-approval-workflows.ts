import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ApprovalWorkflow } from '../types';

export interface GetApprovalWorkflowsParams extends BaseQueryParams {
  isActive?: boolean;
  companyId?: string;
}

export type GetApprovalWorkflowsResponse = ApiPaginatedResponse<ApprovalWorkflow[]>;

export async function getApprovalWorkflows(
  params?: GetApprovalWorkflowsParams
): Promise<GetApprovalWorkflowsResponse> {
  try {
    const headers = params?.companyId ? { 'X-Company-Id': params.companyId } : undefined;
    const { data } = await api.get<ApiPaginatedResponse<ApprovalWorkflow[]>>(
      getApiPath('/approval-workflows'),
      { params, headers }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<ApprovalWorkflow>(error, true);
  }
}
