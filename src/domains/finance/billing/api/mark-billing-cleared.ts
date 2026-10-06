import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface MarkBillingClearedParams {
  billingId: string;
  companyId: string;
}

// ============================================================================
// API Function
// ============================================================================

export async function markBillingCleared(
  params: MarkBillingClearedParams
): Promise<ApiSuccessResponse<Billing>> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Billing>>(
      getApiPath(`/finance/billings/${params.billingId}/mark-cleared`),
      {},
      {
        headers: { 'X-Company-Id': params.companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
