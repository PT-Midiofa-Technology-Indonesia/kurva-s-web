import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ItemCatalog } from '../types';

export interface UpdateItemCatalogPayload {
  itemTypeId: string;
  itemCategoryId: string;
  uomId: string;
  code: string;
  name: string;
  description?: string;
  isAllocatable?: boolean;
  isAsset?: boolean;
  isStock?: boolean;
  isSensitive?: boolean;
  defaultPrice?: number;
  isActive?: boolean;
}

export type UpdateItemCatalogResponse = ApiResponse<ItemCatalog>;

export async function updateItemCatalog(
  id: string,
  payload: UpdateItemCatalogPayload
): Promise<UpdateItemCatalogResponse> {
  try {
    const { data } = await api.put<UpdateItemCatalogResponse>(
      getApiPath(`/item-catalogs/${id}`),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
