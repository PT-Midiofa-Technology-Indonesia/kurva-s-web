import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PaymentRequestDetail } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetPaymentRequestDetailParams {
  id: string;
  companyId?: string;
}

// ============================================================================
// Response
// ============================================================================

export type GetPaymentRequestDetailResponse = ApiSuccessResponse<PaymentRequestDetail>;

// ============================================================================
// API Function
// ============================================================================

export async function getPaymentRequestDetail(
  params: GetPaymentRequestDetailParams
): Promise<GetPaymentRequestDetailResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetPaymentRequestDetailResponse>(
      getApiPath(`/finance/payment-requests/${params.id}`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
