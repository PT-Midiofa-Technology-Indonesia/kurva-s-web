import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostRequest } from '../types';

export interface GetCostRequestParams {
  id: string;
  companyId?: string;
}

// NOTE (Open Question A in the plan): a single-resource GET was not part of the
// 4 confirmed endpoints (list/create/update/cancel). Assumed to exist at this
// conventional path, returning the same shape as a list row. Verify with backend
// before relying on this for cold navigation/refresh of the detail page.
export async function getCostRequest({
  id,
  companyId,
}: GetCostRequestParams): Promise<CostRequest> {
  try {
    const { data } = await api.get<ApiSuccessResponse<CostRequest>>(
      getApiPath(`/cost-requests/${id}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
