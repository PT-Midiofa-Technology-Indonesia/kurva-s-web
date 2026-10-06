import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostItemType } from '../types';

export async function getCostItemType(id: string): Promise<ApiSuccessResponse<CostItemType>> {
  try {
    const { data } = await api.get<ApiSuccessResponse<CostItemType>>(
      getApiPath(`/cost-item-types/${id}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
