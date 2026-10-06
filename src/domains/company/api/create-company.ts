import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Company } from '../types';

export interface CreateCompanyPayload {
  code: string;
  name: string;
  npwp?: string;
  siupNumber?: string;
  phone?: string;
  email?: string;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  postalCode?: string;
  addressDetail?: string;
  isActive: boolean;
  projectCapabilityIds?: string[];
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Company>>(getApiPath('/companies'), payload);
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
