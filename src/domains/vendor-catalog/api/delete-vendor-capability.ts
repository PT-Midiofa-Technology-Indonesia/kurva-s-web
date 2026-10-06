import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteVendorCapability(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/vendor-capabilities/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
