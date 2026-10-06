import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deletePosition(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/positions/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
