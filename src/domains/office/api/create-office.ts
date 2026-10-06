import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Office } from '../types';

export interface CreateOfficePayload {
  companyId: string;
  code: string;
  name: string;
  type: 'main_office' | 'branch_office';
  phone?: string;
  latitude?: number;
  longitude?: number;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  addressDetail?: string;
  isActive: boolean;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string[];
  attendanceRadiusMeters?: number | null;
  /** null lets the backend derive it from provinceId */
  timezone?: string | null;
}

export async function createOffice(payload: CreateOfficePayload): Promise<Office> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Office>>(getApiPath('/offices'), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
