import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorFleetVehicle } from '../types';

export async function getVendorFleetVehicle(id: string): Promise<VendorFleetVehicle> {
  try {
    const { data } = await api.get<ApiSuccessResponse<VendorFleetVehicle>>(
      getApiPath(`/vendor-fleet-vehicles/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
