import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { PurchaseOrderDetail } from '../types/purchase-order-detail';

export interface GetPurchaseOrderDetailParams {
  id: string;
  companyId?: string;
}

export async function getPurchaseOrderDetail(
  id: string,
  companyId?: string
): Promise<PurchaseOrderDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<PurchaseOrderDetail>>(
      getApiPath(`/procurement/purchase-orders/${id}`),
      { headers: companyId ? { 'x-company-id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
