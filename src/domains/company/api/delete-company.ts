import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteCompany(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/companies/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
