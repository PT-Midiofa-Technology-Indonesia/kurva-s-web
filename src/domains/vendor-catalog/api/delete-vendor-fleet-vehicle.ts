import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteVendorFleetVehicle(id: string): Promise<void> {
  try {
    await api.delete(getApiPath(`/vendor-fleet-vehicles/${id}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
