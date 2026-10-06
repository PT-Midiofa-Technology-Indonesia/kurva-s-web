import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorCapability } from '../types';

export interface UpdateVendorCapabilityPayload {
  vendorId?: string;
  skillCatalogId?: string;
  isActive?: boolean;
}

export async function updateVendorCapability(
  id: string,
  payload: UpdateVendorCapabilityPayload
): Promise<VendorCapability> {
  try {
    const { data } = await api.put<ApiSuccessResponse<VendorCapability>>(
      getApiPath(`/vendor-capabilities/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
