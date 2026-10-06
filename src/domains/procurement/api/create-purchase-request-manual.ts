import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface CreatePurchaseRequestManualItem {
  boqItemCostId: string;
  quantity: number;
  remarks?: string;
}

export type PurchaseRequestItemType = 'materialTool' | 'serviceRental' | 'equipmentTool';

export interface CreatePurchaseRequestManualGroup {
  itemType: PurchaseRequestItemType;
  item: CreatePurchaseRequestManualItem[];
}

export interface CreatePurchaseRequestManualPayload {
  companyId: string;
  projectId: string;
  dateRequired: string;
  notes?: string;
  items: CreatePurchaseRequestManualGroup[];
}

export async function createPurchaseRequestManual({
  companyId,
  ...body
}: CreatePurchaseRequestManualPayload): Promise<void> {
  try {
    await api.post<ApiSuccessResponse<null>>(
      getApiPath('/procurement/purchase-requests/manual'),
      body,
      { headers: { 'X-Company-Id': companyId } }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
