import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { DeliveryOrder, RawDeliveryOrder } from '../types';
import { mapDeliveryOrder } from '../types';
import type { CreateDeliveryOrderPayload } from '../types/delivery-order-form';

export async function createDeliveryOrder(
  payload: CreateDeliveryOrderPayload,
  companyId?: string
): Promise<DeliveryOrder> {
  try {
    const { data } = await api.post<ApiSuccessResponse<RawDeliveryOrder>>(
      getApiPath('/logistic/delivery-orders'),
      payload,
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return mapDeliveryOrder(data.data);
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
