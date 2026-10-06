import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorCatalog } from '../types';

export type GetVendorCatalogResponse = ApiSuccessResponse<VendorCatalog>;

export async function getVendorCatalog(id: string): Promise<GetVendorCatalogResponse> {
  try {
    const { data } = await api.get<GetVendorCatalogResponse>(getApiPath(`/vendors/${id}`));
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
