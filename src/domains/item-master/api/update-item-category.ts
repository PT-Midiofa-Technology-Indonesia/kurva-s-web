import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ItemCategory } from '../types';

export interface UpdateItemCategoryPayload {
  itemTypeId?: string;
  code?: string;
  name?: string;
  groupId?: string | null;
  parentId?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export async function updateItemCategory(
  id: string,
  payload: UpdateItemCategoryPayload
): Promise<ItemCategory> {
  try {
    const { data } = await api.put<ApiSuccessResponse<ItemCategory>>(
      getApiPath(`/item-categories/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
