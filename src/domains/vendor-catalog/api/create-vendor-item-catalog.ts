import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorItemCatalog } from '../types';

export interface CreateVendorItemCatalogPayload {
  vendorId: string;
  itemCatalogId: string;
  price: number;
  currency?: string;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  isActive: boolean;
}

export async function createVendorItemCatalog(
  payload: CreateVendorItemCatalogPayload
): Promise<VendorItemCatalog> {
  try {
    const { data } = await api.post<ApiSuccessResponse<VendorItemCatalog>>(
      getApiPath('/vendor-item-catalogs'),
      {
        ...payload,
        currency: payload.currency ?? 'IDR',
        minOrderQuantity: payload.minOrderQuantity ?? 1,
        leadTimeDays: payload.leadTimeDays ?? 1,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
