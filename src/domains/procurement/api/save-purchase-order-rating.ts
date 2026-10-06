import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  PurchaseOrderRatingPayload,
  PurchaseOrderRatingRecord,
} from '../types/purchase-order-rating';

export interface SavePurchaseOrderRatingParams {
  purchaseOrderId: string;
  payload: PurchaseOrderRatingPayload;
}

export async function savePurchaseOrderRating({
  purchaseOrderId,
  payload,
}: SavePurchaseOrderRatingParams): Promise<PurchaseOrderRatingRecord> {
  try {
    const { data } = await api.post<ApiSuccessResponse<PurchaseOrderRatingRecord>>(
      getApiPath(`/purchase-orders/${purchaseOrderId}/rating`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
