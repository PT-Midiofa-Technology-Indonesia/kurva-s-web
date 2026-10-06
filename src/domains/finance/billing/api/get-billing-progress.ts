import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingProgressDetail } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetBillingProgressParams {
  billingId: string;
  companyId?: string;
}

// ============================================================================
// Response
// ============================================================================

export type GetBillingProgressResponse = ApiSuccessResponse<BillingProgressDetail>;

// ============================================================================
// API Function
// ============================================================================

export async function getBillingProgress(
  params: GetBillingProgressParams
): Promise<GetBillingProgressResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetBillingProgressResponse>(
      getApiPath(`/finance/billings/${params.billingId}/progress`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
