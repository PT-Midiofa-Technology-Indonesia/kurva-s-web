import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

// ============================================================================
// Params
// ============================================================================

export interface UpdateBillingScheduleParams {
  billingId: string;
  companyId: string;
  billedAt: string;
  dueDate: string;
  changeReason: string;
}

// ============================================================================
// Response
// ============================================================================

export type UpdateBillingScheduleResponse = ApiSuccessResponse<Billing>;

// ============================================================================
// API Function
// ============================================================================

export async function updateBillingSchedule(
  params: UpdateBillingScheduleParams
): Promise<UpdateBillingScheduleResponse> {
  try {
    const { billingId, companyId, billedAt, dueDate, changeReason } = params;

    const { data } = await api.post<UpdateBillingScheduleResponse>(
      getApiPath(`/finance/billings/${billingId}/schedule`),
      {
        billedAt,
        dueDate,
        changeReason,
      },
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
