import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Company } from '../types';

export interface UpdateCompanyPayload {
  code?: string;
  name?: string;
  npwp?: string | null;
  siupNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  postalCode?: string | null;
  addressDetail?: string | null;
  isActive?: boolean;
  projectCapabilityIds?: string[];
}

export async function updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Company>>(
      getApiPath(`/companies/${id}`),
      payload
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
