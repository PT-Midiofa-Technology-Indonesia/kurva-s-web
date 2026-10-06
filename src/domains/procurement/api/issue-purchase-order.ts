import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface IssuePoParams {
  id: string;
  companyId: string;
}

export async function issuePurchaseOrder({ id, companyId }: IssuePoParams): Promise<void> {
  try {
    await api.post(getApiPath(`/procurement/purchase-orders/${id}/issue`), undefined, {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
