import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostItemType } from '../types';

export interface UpdateCostItemTypePayload {
  code?: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateCostItemType(
  id: string,
  payload: UpdateCostItemTypePayload
): Promise<CostItemType> {
  try {
    const { data } = await api.put<ApiSuccessResponse<CostItemType>>(
      getApiPath(`/cost-item-types/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
