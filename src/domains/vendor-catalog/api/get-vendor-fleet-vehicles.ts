import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { ApiPaginatedResponse } from '@/types/api';
import type { VendorFleetVehicleListItem } from '../types';

export interface GetVendorFleetVehiclesParams extends BaseQueryParams {
  vendorId?: string;
  vehicleType?: string;
  isActive?: boolean;
}

export type GetVendorFleetVehiclesResponse = ApiPaginatedResponse<VendorFleetVehicleListItem[]>;

export async function getVendorFleetVehicles(
  params?: GetVendorFleetVehiclesParams
): Promise<GetVendorFleetVehiclesResponse> {
  try {
    const { data } = await api.get<GetVendorFleetVehiclesResponse>(
      getApiPath('/vendor-fleet-vehicles'),
      { params }
    );
    return data;
  } catch (error: unknown) {
    return handleApiError<VendorFleetVehicleListItem>(error, true);
  }
}
