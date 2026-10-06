import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorCapability } from '../types';

export interface CreateVendorCapabilityPayload {
  vendorId: string;
  skillCatalogId: string;
  isActive: boolean;
}

export async function createVendorCapability(
  payload: CreateVendorCapabilityPayload
): Promise<VendorCapability> {
  try {
    const { data } = await api.post<ApiSuccessResponse<VendorCapability>>(
      getApiPath('/vendor-capabilities'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
