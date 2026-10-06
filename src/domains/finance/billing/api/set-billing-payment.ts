import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentDetail, BillingPaymentMethod } from '../types';

export interface SetBillingPaymentParams {
  billingId: string;
  companyId: string;
  paymentMethods: Array<BillingPaymentMethod | string>;
  bankAccounts?: BillingPaymentDetail['bankAccounts'];
  taxes?: BillingPaymentDetail['taxes'];
  dueDate: string;
  notes?: string;
  action: 'draft' | 'invoiced' | string;
}

export type SetBillingPaymentResponse = ApiSuccessResponse<BillingPaymentDetail>;

export async function setBillingPayment(
  params: SetBillingPaymentParams
): Promise<SetBillingPaymentResponse> {
  try {
    const { billingId, companyId, ...payload } = params;

    const { data } = await api.put<SetBillingPaymentResponse>(
      getApiPath(`/finance/billings/${billingId}/set-payment`),
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
