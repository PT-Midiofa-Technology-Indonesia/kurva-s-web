import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface UpdateDueDatePayload {
  date: string;
  time: string;
}

export type UpdateDueDateResponse = ApiSuccessResponse<null>;

export async function updateDueDate(
  paymentRequestId: string,
  payload: UpdateDueDatePayload
): Promise<UpdateDueDateResponse> {
  try {
    const { data } = await api.patch<UpdateDueDateResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/due-date`),
      payload
    );
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
