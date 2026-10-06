import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeletePoDraftParams {
  id: string;
  companyId: string;
}

export async function deletePoDraft({ id, companyId }: DeletePoDraftParams): Promise<void> {
  try {
    await api.delete(getApiPath(`/procurement/po-drafts/${id}`), {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
