import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostRequest } from '../types';

export interface CreateCostRequestParams {
  formData: FormData;
  companyId?: string;
}

export async function createCostRequest({
  formData,
  companyId,
}: CreateCostRequestParams): Promise<CostRequest> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CostRequest>>(
      getApiPath('/cost-requests'),
      formData,
      {
        headers: {
          'Content-Type': undefined,
          ...(companyId ? { 'X-Company-Id': companyId } : {}),
        },
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
