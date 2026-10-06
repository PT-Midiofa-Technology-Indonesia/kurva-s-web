import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail } from '../types';

export interface SaveBillingTaxParams {
  billingId: string;
  companyId: string;
  taxTypeId: string;
  value: number;
}

export type SaveBillingTaxResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function saveBillingTax(
  params: SaveBillingTaxParams
): Promise<SaveBillingTaxResponse> {
  try {
    const { billingId, companyId, ...payload } = params;

    const { data } = await api.post<SaveBillingTaxResponse>(
      getApiPath(`/finance/billings/${billingId}/taxes`),
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
