import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ItemCatalogListItem } from '../types';

export interface GetItemCatalogsParams extends BaseQueryParams {
  isActive?: boolean;
  itemTypeId?: string;
  itemCategoryId?: string;
  isAllocatable?: boolean;
}

export type GetItemCatalogsResponse = ApiPaginatedResponse<ItemCatalogListItem[]>;

export async function getItemCatalogs(
  params?: GetItemCatalogsParams
): Promise<GetItemCatalogsResponse> {
  try {
    const { data } = await api.get<GetItemCatalogsResponse>(getApiPath('/item-catalogs'), {
      params,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<ItemCatalogListItem>(error, true);
  }
}
