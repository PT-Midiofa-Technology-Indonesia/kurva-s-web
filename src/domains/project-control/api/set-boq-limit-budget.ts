import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';

export interface SetBOQLimitBudgetPayload {
  limitBudgetPercentage: number;
}

export async function setBOQLimitBudget(
  projectId: string,
  payload: SetBOQLimitBudgetPayload
): Promise<ApiSuccessResponse<null>> {
  try {
    const response = await axios.patch<ApiSuccessResponse<null>>(
      getApiPath(`/projects/${projectId}/boq/limit-budget`),
      payload
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
