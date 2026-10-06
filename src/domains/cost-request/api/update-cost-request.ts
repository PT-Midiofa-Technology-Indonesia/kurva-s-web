import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostRequest } from '../types';

export interface UpdateCostRequestParams {
  id: string;
  formData: FormData;
  companyId?: string;
}

// NOTE (Open Question B in the plan): the exact semantics of items[] on PUT
// (full replace vs patch, and whether untouched items' proofs survive) is
// unconfirmed with backend. Do not wire a "Save" action for item content
// changes until that's answered — see schemas/index.ts editCostRequestHeaderSchema.
export async function updateCostRequest({
  id,
  formData,
  companyId,
}: UpdateCostRequestParams): Promise<CostRequest> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CostRequest>>(
      getApiPath(`/cost-requests/${id}`),
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
