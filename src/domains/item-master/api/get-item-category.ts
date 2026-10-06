import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ItemCategory } from '../types';

export type GetItemCategoryResponse = ApiSuccessResponse<ItemCategory>;

export async function getItemCategory(id: string): Promise<GetItemCategoryResponse | null> {
  try {
    const { data } = await api.get<GetItemCategoryResponse>(getApiPath(`/item-categories/${id}`));
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
