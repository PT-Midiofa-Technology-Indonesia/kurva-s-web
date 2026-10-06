import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface UpdatePoItemPayload {
  id: string;
  quantity: number;
  remarks?: string;
}

export interface UpdatePoPayload {
  notes?: string;
  items: UpdatePoItemPayload[];
}

export interface UpdatePoParams {
  id: string;
  companyId?: string;
  payload: UpdatePoPayload;
}

export async function updatePurchaseOrder({
  id,
  companyId,
  payload,
}: UpdatePoParams): Promise<void> {
  try {
    await api.put(
      getApiPath(`/procurement/purchase-orders/${id}`),
      payload,
      companyId ? { headers: { 'X-Company-Id': companyId } } : undefined
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
