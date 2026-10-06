import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateGoodsReceiptPayload, GoodsReceiptDetail } from '../types/goods-receipt';

export async function createGoodsReceipt(
  payload: CreateGoodsReceiptPayload,
  companyId?: string
): Promise<GoodsReceiptDetail> {
  try {
    const { data } = await api.post<ApiSuccessResponse<GoodsReceiptDetail>>(
      getApiPath('/procurement/goods-receipts'),
      payload,
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
