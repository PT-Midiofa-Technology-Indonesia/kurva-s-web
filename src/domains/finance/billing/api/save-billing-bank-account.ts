import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail } from '../types';

export interface SaveBillingBankAccountParams {
  billingId: string;
  companyId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export type SaveBillingBankAccountResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function saveBillingBankAccount(
  params: SaveBillingBankAccountParams
): Promise<SaveBillingBankAccountResponse> {
  try {
    const { billingId, companyId, ...payload } = params;

    const { data } = await api.post<SaveBillingBankAccountResponse>(
      getApiPath(`/finance/billings/${billingId}/bank-accounts`),
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
