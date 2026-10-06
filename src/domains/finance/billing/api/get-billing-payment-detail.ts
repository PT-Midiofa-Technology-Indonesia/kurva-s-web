import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail } from '../types';

export interface GetBillingPaymentDetailParams {
  billingId: string;
  companyId?: string;
}

export type GetBillingPaymentDetailResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function getBillingPaymentDetail(
  params: GetBillingPaymentDetailParams
): Promise<GetBillingPaymentDetailResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetBillingPaymentDetailResponse>(
      getApiPath(`/finance/billings/${params.billingId}/payment-detail`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
