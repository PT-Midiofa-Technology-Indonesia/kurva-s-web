import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { ItemCatalog } from '../types';

export type GetItemCatalogResponse = ApiResponse<ItemCatalog>;

export async function getItemCatalog(id: string): Promise<GetItemCatalogResponse> {
  try {
    const { data } = await api.get<GetItemCatalogResponse>(getApiPath(`/item-catalogs/${id}`));
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
