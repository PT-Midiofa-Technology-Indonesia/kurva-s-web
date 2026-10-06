import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PayrollDraftDetail } from '../types';

export async function generatePayrollDraft(params: {
  id: string;
  companyId: string;
}): Promise<PayrollDraftDetail> {
  try {
    const response = await api.post<ApiSuccessResponse<PayrollDraftDetail>>(
      getApiPath(`/human-resource/payroll-drafts/${params.id}/generate`),
      {},
      { headers: { 'X-Company-Id': params.companyId } }
    );
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
