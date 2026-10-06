import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteVendorItemCatalog(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/vendor-item-catalogs/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
