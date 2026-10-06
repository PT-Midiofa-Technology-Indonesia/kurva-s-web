import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { AssetCategoryListItem } from '../types';

export interface GetAssetCategoriesParams extends BaseQueryParams {
  isActive?: boolean;
  depreciationMethod?: string;
}

export type GetAssetCategoriesResponse = ApiPaginatedResponse<AssetCategoryListItem[]>;

function toBooleanQueryParam(value?: boolean) {
  if (value === undefined) return undefined;
  return Number(value);
}

export async function getAssetCategories(
  params?: GetAssetCategoriesParams
): Promise<GetAssetCategoriesResponse> {
  try {
    const queryParams = params
      ? {
          ...params,
          isActive: toBooleanQueryParam(params.isActive),
        }
      : undefined;

    const { data } = await api.get<GetAssetCategoriesResponse>(getApiPath('/asset-categories'), {
      params: queryParams,
    });
    return data;
  } catch (error: unknown) {
    return handleApiError<AssetCategoryListItem>(error, true);
  }
}
