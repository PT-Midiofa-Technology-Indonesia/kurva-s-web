import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface SaveBillingInformationParams {
  companyId: string;
  projectId: string;
  billedAt: string;
  dueDate: string;
  notes?: string;
}

// ============================================================================
// Response
// ============================================================================

export type SaveBillingInformationResponse = ApiSuccessResponse<Billing>;

// ============================================================================
// API Function
// ============================================================================

export async function saveBillingInformation(
  params: SaveBillingInformationParams
): Promise<SaveBillingInformationResponse> {
  try {
    const { companyId, projectId, ...payload } = params;

    const { data } = await api.post<SaveBillingInformationResponse>(
      getApiPath(`/finance/billings/${projectId}/information`),
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
