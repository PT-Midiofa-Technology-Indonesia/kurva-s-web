import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteDoLoadingOrder(
  doId: string,
  loadingOrderId: string,
  companyId?: string
): Promise<void> {
  try {
    await api.delete(
      getApiPath(`/logistic/delivery-orders/${doId}/loading-orders/${loadingOrderId}`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : {},
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
