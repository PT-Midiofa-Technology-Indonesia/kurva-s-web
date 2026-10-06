import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ItemCategory } from '../types';

export interface CreateItemCategoryPayload {
  itemTypeId: string;
  code: string;
  name: string;
  groupId?: string | null;
  parentId?: string | null;
  description?: string;
  isActive?: boolean;
}

export async function createItemCategory(
  payload: CreateItemCategoryPayload
): Promise<ItemCategory> {
  try {
    const { data } = await api.post<ApiSuccessResponse<ItemCategory>>(
      getApiPath('/item-categories'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
