import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface CancelPoDraftParams {
  id: string;
  companyId: string;
}

export async function cancelPoDraft({ id, companyId }: CancelPoDraftParams): Promise<void> {
  try {
    await api.post(getApiPath(`/procurement/po-drafts/${id}/cancel`), undefined, {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
