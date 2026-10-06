import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorItemCatalog } from '../types';

export async function getVendorItemCatalog(id: string): Promise<VendorItemCatalog> {
  try {
    const { data } = await api.get<ApiSuccessResponse<VendorItemCatalog>>(
      getApiPath(`/vendor-item-catalogs/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
