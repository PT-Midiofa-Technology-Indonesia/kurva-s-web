import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostRequest } from '../types';

export interface CancelCostRequestParams {
  id: string;
  companyId?: string;
}

export async function cancelCostRequest({
  id,
  companyId,
}: CancelCostRequestParams): Promise<CostRequest> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CostRequest>>(
      getApiPath(`/cost-requests/${id}/cancel`),
      undefined,
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
