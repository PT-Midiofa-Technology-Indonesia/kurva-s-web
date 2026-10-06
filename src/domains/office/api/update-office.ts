import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Office } from '../types';

export interface UpdateOfficePayload {
  companyId?: string;
  code?: string;
  name?: string;
  type?: 'main_office' | 'branch_office';
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  addressDetail?: string | null;
  isActive?: boolean;
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[];
  attendanceRadiusMeters?: number | null;
  /** null lets the backend derive it from provinceId */
  timezone?: string | null;
}

export async function updateOffice(id: string, payload: UpdateOfficePayload): Promise<Office> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Office>>(
      getApiPath(`/offices/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
