import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export type DeletePaymentEventResponse = ApiSuccessResponse<null>;

/**
 * Delete a payment event
 * DELETE /v1/finance/payment-requests/:id/events/:eventId
 */
export async function deletePaymentEvent(
  paymentRequestId: string,
  eventId: string
): Promise<DeletePaymentEventResponse> {
  try {
    const { data } = await api.delete<DeletePaymentEventResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/events/${eventId}`)
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
