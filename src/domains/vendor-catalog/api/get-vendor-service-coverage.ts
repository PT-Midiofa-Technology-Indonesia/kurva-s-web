import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorServiceCoverage } from '../types';

export async function getVendorServiceCoverage(
  vendorId: string,
  provinceId: string
): Promise<VendorServiceCoverage> {
  try {
    const { data } = await api.get<ApiSuccessResponse<VendorServiceCoverage>>(
      getApiPath(`/vendor-service-coverages/${vendorId}/${provinceId}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
