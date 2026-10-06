import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PaymentType } from '../types';

export type GetPaymentTypeResponse = ApiResponse<PaymentType>;

export async function getPaymentType(id: string): Promise<GetPaymentTypeResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<PaymentType>>(getApiPath(`/payment-types/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
