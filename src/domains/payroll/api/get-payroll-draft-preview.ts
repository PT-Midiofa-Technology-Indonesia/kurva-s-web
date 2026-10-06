import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PayrollDraftPreview } from '../types';

export interface GetPayrollDraftPreviewParams {
  id: string;
  companyId: string;
}

export async function getPayrollDraftPreview({
  id,
  companyId,
}: GetPayrollDraftPreviewParams): Promise<PayrollDraftPreview> {
  try {
    const response = await api.get<ApiSuccessResponse<PayrollDraftPreview>>(
      getApiPath(`/human-resource/payroll-drafts/${id}/preview`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
