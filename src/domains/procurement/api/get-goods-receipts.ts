import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { GoodsReceiptListItem } from '../types/goods-receipt';

export interface GetGoodsReceiptsParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  warehouseId?: string;
  companyId?: string;
}

export type GetGoodsReceiptsResponse = ApiPaginatedResponse<GoodsReceiptListItem[]>;

export async function getGoodsReceipts(
  params?: GetGoodsReceiptsParams
): Promise<GetGoodsReceiptsResponse> {
  try {
    const queryParams: Record<string, unknown> = {};
    let companyId: string | undefined;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'companyId') {
          companyId = value as string;
          return;
        }
        queryParams[key] = value;
      });
    }

    const { data } = await api.get<GetGoodsReceiptsResponse>(
      getApiPath('/procurement/goods-receipts'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<GoodsReceiptListItem>(error, true);
  }
}
