import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ApprovalRequestDetail } from '../types';

export type GetApprovalRequestResponse = ApiSuccessResponse<ApprovalRequestDetail>;

export async function getApprovalRequest(id: string): Promise<GetApprovalRequestResponse> {
  try {
    const { data } = await api.get<GetApprovalRequestResponse>(
      getApiPath(`/approval-requests/${id}`)
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
