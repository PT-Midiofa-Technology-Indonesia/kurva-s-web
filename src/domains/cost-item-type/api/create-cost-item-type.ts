import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CostItemType } from '../types';

export interface CreateCostItemTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export async function createCostItemType(
  payload: CreateCostItemTypePayload
): Promise<CostItemType> {
  try {
    const { data } = await api.post<ApiSuccessResponse<CostItemType>>(
      getApiPath('/cost-item-types'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
