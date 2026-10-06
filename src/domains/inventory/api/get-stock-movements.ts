import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { StockMovementListItem } from '../types';

export interface GetStockMovementsParams extends BaseQueryParams {
  warehouseId?: string;
  itemCatalogId?: string;
  resourceUnitId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
}

export type GetStockMovementsResponse = ApiPaginatedResponse<StockMovementListItem[]>;

export async function getStockMovements(
  params?: GetStockMovementsParams,
  companyId?: string
): Promise<GetStockMovementsResponse> {
  try {
    const { itemCatalogId, ...rest } = params ?? {};
    const { data } = await api.get<GetStockMovementsResponse>(
      getApiPath('/inventory/stock-movements'),
      {
        // Backend spec names this `itemCatelogId` (sic) — kept isolated here
        // so the misspelling doesn't leak into the rest of the domain.
        params: { ...rest, itemCatelogId: itemCatalogId },
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<StockMovementListItem>(error, true);
  }
}
