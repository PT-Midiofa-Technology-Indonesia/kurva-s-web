import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/types/api';
import type { StockMaterialListItem, UpdateStockThresholdPayload } from '../types';

export type UpdateStockThresholdResponse = ApiPaginatedResponse<StockMaterialListItem[]>;

export async function updateStockThreshold(
  id: string,
  payload: UpdateStockThresholdPayload,
  companyId?: string
): Promise<UpdateStockThresholdResponse> {
  try {
    const { data } = await api.put<UpdateStockThresholdResponse>(
      getApiPath(`/inventory/stock-monitoring/materials/${id}/threshold`),
      payload,
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<StockMaterialListItem>(error, true);
  }
}
