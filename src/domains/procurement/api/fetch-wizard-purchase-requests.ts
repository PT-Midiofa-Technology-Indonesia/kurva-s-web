import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { PurchaseRequest } from '../types/api';

export async function fetchWizardPurchaseRequests(
  projectId: string,
  companyId?: string
): Promise<PurchaseRequest[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<PurchaseRequest[]>>(
      getApiPath('/procurement/purchase-requests'),
      {
        params: { projectId, status: 'open' },
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
