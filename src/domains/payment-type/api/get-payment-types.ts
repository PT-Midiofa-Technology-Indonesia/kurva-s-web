import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { PaymentTypeListItem } from '../types';

export interface GetPaymentTypesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetPaymentTypesResponse = ApiPaginatedResponse<PaymentTypeListItem[]>;

export async function getPaymentTypes(
  params?: GetPaymentTypesParams
): Promise<GetPaymentTypesResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<PaymentTypeListItem[]>>(
      getApiPath('/payment-types'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<PaymentTypeListItem>(error, true);
  }
}
