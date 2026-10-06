import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ApproverOptionsResponse } from '../types';

export async function getApproverOptions(companyId?: string): Promise<ApproverOptionsResponse> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.get<ApiSuccessResponse<ApproverOptionsResponse>>(
      getApiPath('/approval-workflows/options/approvers'),
      { headers }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
