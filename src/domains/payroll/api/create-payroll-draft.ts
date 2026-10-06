import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { CreateDraftFormData, PayrollDraftSummary } from '../types';

export async function createPayrollDraft(
  payload: CreateDraftFormData & { companyId: string }
): Promise<PayrollDraftSummary> {
  try {
    const { companyId, periodType, periodStart, periodEnd, notes } = payload;
    const response = await api.post<ApiSuccessResponse<PayrollDraftSummary>>(
      getApiPath('/human-resource/payroll-drafts'),
      {
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        notes: notes || null,
      },
      { headers: { 'X-Company-Id': companyId } }
    );
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
