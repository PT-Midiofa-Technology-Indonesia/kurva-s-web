import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Warehouse } from '../types';

export interface CreateWarehousePayload {
  companyId: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  addressDetail?: string;
  latitude?: string;
  longitude?: string;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string[];
  attendanceRadiusMeters?: number | null;
  /** null lets the backend derive it from provinceId */
  timezone?: string | null;
}

export async function createWarehouse(payload: CreateWarehousePayload): Promise<Warehouse> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Warehouse>>(
      getApiPath('/warehouses'),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
