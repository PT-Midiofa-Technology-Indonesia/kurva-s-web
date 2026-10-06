import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ItemCatalog } from '../types';

export interface CreateItemCatalogPayload {
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

export type CreateItemCatalogResponse = ApiResponse<ItemCatalog>;

export async function createItemCatalog(
  payload: CreateItemCatalogPayload
): Promise<CreateItemCatalogResponse> {
  try {
    const { data } = await api.post<CreateItemCatalogResponse>(
      getApiPath('/item-catalogs'),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
