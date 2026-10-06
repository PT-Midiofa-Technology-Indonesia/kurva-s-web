import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteItemCatalog(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/item-catalogs/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
