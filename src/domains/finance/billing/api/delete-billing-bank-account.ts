import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail } from '../types';

export interface DeleteBillingBankAccountParams {
  billingId: string;
  companyId: string;
  bankAccountId: string;
}

export type DeleteBillingBankAccountResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function deleteBillingBankAccount(
  params: DeleteBillingBankAccountParams
): Promise<DeleteBillingBankAccountResponse> {
  try {
    const { billingId, companyId, bankAccountId } = params;

    const { data } = await api.delete<DeleteBillingBankAccountResponse>(
      getApiPath(`/finance/billings/${billingId}/bank-accounts/${bankAccountId}`),
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
