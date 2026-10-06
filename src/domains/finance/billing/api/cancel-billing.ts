import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface CancelBillingParams {
  billingId: string;
  companyId: string;
  reason?: string;
}

// ============================================================================
// API Function
// ============================================================================

export async function cancelBilling(
  params: CancelBillingParams
): Promise<ApiSuccessResponse<Billing>> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Billing>>(
      getApiPath(`/finance/billings/${params.billingId}/cancel`),
      { reason: params.reason },
      {
        headers: { 'X-Company-Id': params.companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
