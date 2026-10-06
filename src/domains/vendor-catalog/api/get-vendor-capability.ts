import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorCapability } from '../types';

export async function getVendorCapability(id: string): Promise<VendorCapability> {
  try {
    const { data } = await api.get<ApiSuccessResponse<VendorCapability>>(
      getApiPath(`/vendor-capabilities/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
