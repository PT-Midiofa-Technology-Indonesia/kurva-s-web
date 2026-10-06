import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface CancelPoParams {
  id: string;
  companyId: string;
}

export async function cancelPurchaseOrder({ id, companyId }: CancelPoParams): Promise<void> {
  try {
    await api.post(getApiPath(`/procurement/purchase-orders/${id}/cancel`), undefined, {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
