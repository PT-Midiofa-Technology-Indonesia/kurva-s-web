import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import { api } from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { CostItemTypeListItem } from '../types';

export interface GetCostItemTypesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

export async function getCostItemTypes(
  params?: GetCostItemTypesParams
): Promise<ApiPaginatedResponse<CostItemTypeListItem>> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<CostItemTypeListItem>>(
      getApiPath('/cost-item-types'),
      { params }
    );
    return data;
  } catch (error) {
    return handleApiError<CostItemTypeListItem>(error, true);
  }
}
