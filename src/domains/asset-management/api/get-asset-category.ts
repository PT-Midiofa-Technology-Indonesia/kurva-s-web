import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssetCategory } from '../types';

export type GetAssetCategoryResponse = ApiSuccessResponse<AssetCategory>;

export async function getAssetCategory(id: string): Promise<GetAssetCategoryResponse | null> {
  try {
    const { data } = await api.get<GetAssetCategoryResponse>(getApiPath(`/asset-categories/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
