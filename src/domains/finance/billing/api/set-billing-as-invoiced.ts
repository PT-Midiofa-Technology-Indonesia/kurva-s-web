import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface SetBillingAsInvoicedParams {
  billingId: string;
  companyId: string;
}

// ============================================================================
// API Function
// ============================================================================

export async function setBillingAsInvoiced(params: SetBillingAsInvoicedParams): Promise<Billing> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Billing>>(
      getApiPath(`/finance/billings/${params.billingId}/invoice`),
      {},
      {
        headers: { 'X-Company-Id': params.companyId },
      }
    );

    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
