import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface UpdateBillingProgressParams {
  billingId: string;
  companyId?: string;
  progressItems: Array<{
    boqItemId: string;
    progress: number;
  }>;
}

// ============================================================================
// API Function
// ============================================================================

export async function updateBillingProgress(params: UpdateBillingProgressParams): Promise<Billing> {
  try {
    const { billingId, companyId, progressItems } = params;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.put<{ data: Billing }>(
      getApiPath(`/finance/billings/${billingId}/progress`),
      { progressItems },
      { headers }
    );

    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
