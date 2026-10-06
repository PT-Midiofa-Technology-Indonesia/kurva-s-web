import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PayrollDraftDetail } from '../types';

export interface GetPayrollDraftParams {
  id: string;
  companyId: string;
}

export async function getPayrollDraft({
  id,
  companyId,
}: GetPayrollDraftParams): Promise<PayrollDraftDetail> {
  try {
    const response = await api.get<ApiSuccessResponse<PayrollDraftDetail>>(
      getApiPath(`/human-resource/payroll-drafts/${id}`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
