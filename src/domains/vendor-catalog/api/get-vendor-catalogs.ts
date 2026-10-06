import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorCatalogListItem } from '../types';

export interface GetVendorCatalogsParams extends BaseQueryParams {
  isActive?: boolean;
  isSubcontractor?: boolean;
}

export type GetVendorCatalogsResponse = ApiPaginatedResponse<VendorCatalogListItem[]>;

export async function getVendorCatalogs(
  params?: GetVendorCatalogsParams
): Promise<GetVendorCatalogsResponse> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<VendorCatalogListItem[]>>(
      getApiPath('/vendors'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorCatalogListItem>(error, true);
  }
}
