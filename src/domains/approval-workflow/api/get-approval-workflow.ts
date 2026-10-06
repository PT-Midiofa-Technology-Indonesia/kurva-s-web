import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ApprovalWorkflowDetail } from '../types';

export async function getApprovalWorkflow(
  id: string,
  companyId?: string
): Promise<ApprovalWorkflowDetail> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.get<ApiSuccessResponse<ApprovalWorkflowDetail>>(
      getApiPath(`/approval-workflows/${id}`),
      { headers }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
