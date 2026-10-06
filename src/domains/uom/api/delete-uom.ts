import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import { api } from '@/shared/lib/axios';

export async function deleteUom(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/uoms/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
