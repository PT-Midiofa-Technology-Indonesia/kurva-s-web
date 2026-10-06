import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteVendorServiceCoverage(
  vendorId: string,
  provinceId: string
): Promise<void> {
  try {
    await api.delete(getApiPath(`/vendor-service-coverages/${vendorId}/${provinceId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
