import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import { api } from '@/shared/lib/axios';

export async function deleteJobItemType(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/job-item-types/${id}`));
  } catch (error) {
    handleApiError(error);
  }
}
