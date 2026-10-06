import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { WarehouseListItem } from '../types';

export interface GetWarehousesParams extends BaseQueryParams {
  isActive?: boolean;
  companyId?: string;
}

export type GetWarehousesResponse = ApiPaginatedResponse<WarehouseListItem[]>;

export async function getWarehouses(params?: GetWarehousesParams): Promise<GetWarehousesResponse> {
  try {
    const { companyId, ...rest } = params ?? {};
    const { data } = await api.get<ApiPaginatedResponse<WarehouseListItem[]>>(
      getApiPath('/warehouses'),
      {
        params: companyId ? { ...rest, companyId } : rest,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<WarehouseListItem>(error, true);
  }
}
