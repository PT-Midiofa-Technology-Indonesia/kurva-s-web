import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorItemCatalog } from '../types';

export interface UpdateVendorItemCatalogPayload {
  vendorId?: string;
  itemCatalogId?: string;
  price?: number;
  currency?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  isActive?: boolean;
}

export async function updateVendorItemCatalog(
  id: string,
  payload: UpdateVendorItemCatalogPayload
): Promise<VendorItemCatalog> {
  try {
    const { data } = await api.put<ApiSuccessResponse<VendorItemCatalog>>(
      getApiPath(`/vendor-item-catalogs/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
