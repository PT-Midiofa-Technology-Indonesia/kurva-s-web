import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { ItemTypeListItem } from '../types';

export interface GetItemTypesParams extends BaseQueryParams {
  isActive?: boolean;
}

export type GetItemTypesResponse = ApiPaginatedResponse<ItemTypeListItem[]>;

export async function getItemTypes(params?: GetItemTypesParams): Promise<GetItemTypesResponse> {
  try {
    const { data } = await api.get<GetItemTypesResponse>(getApiPath('/item-types'), { params });
    return data;
  } catch (error: unknown) {
    return handleApiError<ItemTypeListItem>(error, true);
  }
}
