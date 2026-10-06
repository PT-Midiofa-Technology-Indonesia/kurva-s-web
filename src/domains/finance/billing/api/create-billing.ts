import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing, BillingType } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface CreateBillingParams {
  companyId: string;
  projectId: string;
  billingType: BillingType | string;
  percentage?: number;
  amount?: number;
  billedAt: string;
  dueDate: string;
  notes?: string;
}

// ============================================================================
// Response
// ============================================================================

export type CreateBillingResponse = ApiSuccessResponse<Billing>;

// ============================================================================
// API Function
// ============================================================================

export async function createBilling(params: CreateBillingParams): Promise<CreateBillingResponse> {
  try {
    const { companyId, billingType, percentage, amount, ...restPayload } = params;

    const payload = {
      ...restPayload,
      billingType,
      percentage: billingType === 'lumsum' || billingType === 'lumpsum' ? percentage : undefined,
      amount: billingType === 'unit_price' ? amount : undefined,
    };

    const { data } = await api.post<CreateBillingResponse>(
      getApiPath('/finance/billings'),
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
