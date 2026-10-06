import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteDoItem(
  doId: string,
  itemId: string,
  companyId?: string
): Promise<void> {
  try {
    await api.delete(getApiPath(`/logistic/delivery-orders/${doId}/items/${itemId}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : {},
    });
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
