import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail } from '../types';

export interface DeleteBillingTaxParams {
  billingId: string;
  companyId: string;
  taxId: string;
}

export type DeleteBillingTaxResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function deleteBillingTax(
  params: DeleteBillingTaxParams
): Promise<DeleteBillingTaxResponse> {
  try {
    const { billingId, companyId, taxId } = params;

    const { data } = await api.delete<DeleteBillingTaxResponse>(
      getApiPath(`/finance/billings/${billingId}/taxes/${taxId}`),
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
