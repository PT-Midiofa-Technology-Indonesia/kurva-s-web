import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingPaymentProof } from '../types';

export interface GetBillingPaymentProofsParams {
  billingId: string;
  companyId?: string;
}

export type GetBillingPaymentProofsResponse = ApiSuccessResponse<BillingPaymentProof[]>;

export async function getBillingPaymentProofs(
  params: GetBillingPaymentProofsParams
): Promise<GetBillingPaymentProofsResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetBillingPaymentProofsResponse>(
      getApiPath(`/finance/billings/${params.billingId}/payment-proofs`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
