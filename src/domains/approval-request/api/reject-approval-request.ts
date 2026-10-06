import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ApprovalDecisionPayload } from '../types';

export async function rejectApprovalRequest(
  id: string,
  payload: ApprovalDecisionPayload
): Promise<ApiSuccessResponse<null>> {
  try {
    const { data } = await api.post<ApiSuccessResponse<null>>(
      getApiPath(`/approval-requests/${id}/reject`),
      payload
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
