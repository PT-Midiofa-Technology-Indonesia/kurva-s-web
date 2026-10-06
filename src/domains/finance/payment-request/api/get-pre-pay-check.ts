import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PaymentRequestPrePayCheck } from '../types';

export interface GetPrePayCheckParams {
  id: string;
  companyId?: string;
}

export type GetPrePayCheckResponse = ApiSuccessResponse<PaymentRequestPrePayCheck>;

export async function getPrePayCheck(
  params: GetPrePayCheckParams
): Promise<GetPrePayCheckResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetPrePayCheckResponse>(
      getApiPath(`/finance/payment-requests/${params.id}/pre-pay-check`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
