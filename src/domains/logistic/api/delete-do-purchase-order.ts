import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteDoPurchaseOrder(
  doId: string,
  poId: string,
  companyId?: string
): Promise<void> {
  try {
    await api.delete(getApiPath(`/logistic/delivery-orders/${doId}/purchase-orders/${poId}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : {},
    });
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
