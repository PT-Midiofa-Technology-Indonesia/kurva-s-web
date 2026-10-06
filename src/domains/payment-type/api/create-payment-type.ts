import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PaymentType } from '../types';

export interface CreatePaymentTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createPaymentType(payload: CreatePaymentTypePayload): Promise<PaymentType> {
  try {
    const { data } = await api.post<ApiSuccessResponse<PaymentType>>(
      getApiPath('/payment-types'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
