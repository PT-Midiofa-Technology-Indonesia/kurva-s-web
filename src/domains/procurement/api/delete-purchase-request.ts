import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeletePurchaseRequestParams {
  id: string;
  companyId: string;
}

export async function deletePurchaseRequest({
  id,
  companyId,
}: DeletePurchaseRequestParams): Promise<void> {
  try {
    await api.delete(getApiPath(`/procurement/purchase-requests/${id}`), {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
