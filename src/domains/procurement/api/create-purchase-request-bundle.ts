import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

type PurchaseRequestCostCategory = 'material' | 'equipment' | 'manpower';

export interface CreatePurchaseRequestBundlePayload {
  companyId: string;
  projectId: string;
  boqItemId: string;
  categories: PurchaseRequestCostCategory[];
  dateRequired: string;
  notes?: string;
}

export async function createPurchaseRequestBundle({
  companyId,
  ...body
}: CreatePurchaseRequestBundlePayload): Promise<void> {
  try {
    await api.post<ApiSuccessResponse<null>>(
      getApiPath('/procurement/purchase-requests/bundle'),
      body,
      { headers: { 'X-Company-Id': companyId } }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
