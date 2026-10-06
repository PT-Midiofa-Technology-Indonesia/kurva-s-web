import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { StockMaterialListItem } from '../types';

export interface GetStockMaterialsParams extends BaseQueryParams {
  warehouseId?: string;
  isActive?: boolean;
}

export type GetStockMaterialsResponse = ApiPaginatedResponse<StockMaterialListItem[]>;

export async function getStockMaterials(
  params?: GetStockMaterialsParams,
  companyId?: string
): Promise<GetStockMaterialsResponse> {
  try {
    const { data } = await api.get<GetStockMaterialsResponse>(
      getApiPath('/inventory/stock-monitoring/materials'),
      {
        params,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<StockMaterialListItem>(error, true);
  }
}
