import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { GoodsReceiptDetail } from '../types/goods-receipt';

export async function getGoodsReceiptDetail(
  id: string,
  companyId?: string
): Promise<GoodsReceiptDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<GoodsReceiptDetail>>(
      getApiPath(`/procurement/goods-receipts/${id}`),
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
