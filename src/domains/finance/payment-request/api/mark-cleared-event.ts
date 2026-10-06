import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export type MarkClearedEventResponse = ApiSuccessResponse<null>;

/**
 * Mark a payment event as cleared
 * POST /v1/finance/payment-requests/:id/events/:eventId/mark-cleared
 */
export async function markClearedEvent(
  paymentRequestId: string,
  eventId: string
): Promise<MarkClearedEventResponse> {
  try {
    const { data } = await api.post<MarkClearedEventResponse>(
      getApiPath(`/finance/payment-requests/${paymentRequestId}/events/${eventId}/mark-cleared`)
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
