import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PurchaseOrderRatingEnvelope } from '../types/purchase-order-rating';

export async function getPurchaseOrderRating(
  purchaseOrderId: string
): Promise<PurchaseOrderRatingEnvelope> {
  try {
    const { data } = await api.get<ApiSuccessResponse<PurchaseOrderRatingEnvelope>>(
      getApiPath(`/purchase-orders/${purchaseOrderId}/rating`)
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
