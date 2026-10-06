import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorFleetVehicle } from '../types';

export interface CreateVendorFleetVehiclePayload {
  vendorId: string;
  name: string;
  code: string;
  vehicleType: string;
  plateNumber: string;
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  weightMax?: number;
  weightUomId?: string;
  volumeMax?: number;
  volumeUomId?: string;
  pricePerTripMin?: number;
  pricePerDistanceMin?: number;
  pricePerDistanceMax?: number;
  distanceValueMin?: number;
  distanceValueMax?: number;
  distanceUomId?: string;
  notes?: string;
  isActive: boolean;
}

export async function createVendorFleetVehicle(
  payload: CreateVendorFleetVehiclePayload
): Promise<VendorFleetVehicle> {
  try {
    const { data } = await api.post<ApiSuccessResponse<VendorFleetVehicle>>(
      getApiPath('/vendor-fleet-vehicles'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
