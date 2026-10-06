import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function cancelDeliveryOrder(id: string, companyId?: string): Promise<void> {
  try {
    await api.post(
      getApiPath(`/logistic/delivery-orders/${id}/cancel`),
      {},
      { headers: companyId ? { 'X-Company-Id': companyId } : {} }
    );
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
