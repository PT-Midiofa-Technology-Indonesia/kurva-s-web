import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { StockEquipmentListItem } from '../types';

/**
 * `status` is not documented in the endpoint spec, but the Figma design has a
 * status filter — sent optimistically; confirm with backend that it's honoured.
 */
export interface GetStockEquipmentsParams extends BaseQueryParams {
  warehouseId?: string;
  isActive?: boolean;
  status?: string;
}

export type GetStockEquipmentsResponse = ApiPaginatedResponse<StockEquipmentListItem[]>;

export async function getStockEquipments(
  params?: GetStockEquipmentsParams,
  companyId?: string
): Promise<GetStockEquipmentsResponse> {
  try {
    const { data } = await api.get<GetStockEquipmentsResponse>(
      getApiPath('/inventory/stock-monitoring/equipment'),
      {
        params,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<StockEquipmentListItem>(error, true);
  }
}
