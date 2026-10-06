import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorItemCatalogListItem } from '../types';

export interface GetVendorItemCatalogsParams extends BaseQueryParams {
  vendorId?: string;
  isActive?: boolean;
}

export type GetVendorItemCatalogsResponse = ApiPaginatedResponse<VendorItemCatalogListItem[]>;

export async function getVendorItemCatalogs(
  params?: GetVendorItemCatalogsParams
): Promise<GetVendorItemCatalogsResponse> {
  try {
    const { data } = await api.get<GetVendorItemCatalogsResponse>(
      getApiPath('/vendor-item-catalogs'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorItemCatalogListItem>(error, true);
  }
}
