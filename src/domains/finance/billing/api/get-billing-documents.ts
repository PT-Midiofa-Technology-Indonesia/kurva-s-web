import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingDocuments } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface GetBillingDocumentsParams {
  billingId: string;
  companyId?: string;
}

// ============================================================================
// API Function
// ============================================================================

export async function getBillingDocuments(
  params: GetBillingDocumentsParams
): Promise<ApiSuccessResponse<BillingDocuments>> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<ApiSuccessResponse<BillingDocuments>>(
      getApiPath(`/finance/billings/${params.billingId}/documents`),
      { headers }
    );

    const normalizedRequirements = [
      ...(data.data?.mandatoryRequirements ?? []),
      ...(data.data?.optionalRequirements ?? []),
    ];

    return {
      ...data,
      data: {
        ...data.data,
        requirements: normalizedRequirements,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
