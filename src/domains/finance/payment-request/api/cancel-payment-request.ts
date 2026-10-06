import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export type CancelPaymentRequestResponse = ApiSuccessResponse<null>;

/**
 * Cancel a payment request
 * POST /v1/finance/payment-requests/:id/cancel
 */
export async function cancelPaymentRequest(
  paymentRequestId: string
): Promise<CancelPaymentRequestResponse> {
  try {
    const { data } = await api.post<CancelPaymentRequestResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/cancel`)
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
