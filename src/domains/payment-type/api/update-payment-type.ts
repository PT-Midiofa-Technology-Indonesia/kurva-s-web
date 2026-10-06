import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PaymentType } from '../types';

export interface UpdatePaymentTypePayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updatePaymentType(
  id: string,
  payload: UpdatePaymentTypePayload
): Promise<PaymentType> {
  try {
    const { data } = await api.put<ApiSuccessResponse<PaymentType>>(
      getApiPath(`/payment-types/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
