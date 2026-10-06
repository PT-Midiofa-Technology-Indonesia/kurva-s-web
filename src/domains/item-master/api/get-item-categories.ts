import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ItemCategoryListItem } from '../types';

export interface GetItemCategoriesParams extends BaseQueryParams {
  isActive?: boolean;
  itemTypeId?: string;
}

export type GetItemCategoriesResponse = ApiPaginatedResponse<ItemCategoryListItem[]>;

export async function getItemCategories(
  params?: GetItemCategoriesParams
): Promise<GetItemCategoriesResponse> {
  try {
    const { data } = await api.get<GetItemCategoriesResponse>(getApiPath('/item-categories'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<ItemCategoryListItem>(error, true);
  }
}
