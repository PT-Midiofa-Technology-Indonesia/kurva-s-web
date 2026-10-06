import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ApprovalWorkflowDetail, UpdateApprovalWorkflowPayload } from '../types';

export async function updateApprovalWorkflow(
  id: string,
  payload: UpdateApprovalWorkflowPayload,
  companyId?: string
): Promise<ApprovalWorkflowDetail> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.put<ApiSuccessResponse<ApprovalWorkflowDetail>>(
      getApiPath(`/approval-workflows/${id}`),
      payload,
      { headers }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
