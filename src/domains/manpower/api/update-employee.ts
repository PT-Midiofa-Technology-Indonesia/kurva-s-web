import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Employee } from '../types';

export interface UpdateEmployeePayload {
  fullName?: string;
  employeeType?: string;
  isActive?: boolean;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  provinceId?: string | null;
  cityId?: string | null;
  districtId?: string | null;
  villageId?: string | null;
  postalCode?: string | null;
  addressDetail?: string | null;
  nik?: string | null;
  npwp?: string | null;
  contractType?: string | null;
  salaryType?: string | null;
  workPlacement?: string | null;
  hireDate?: string | null;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
  companyId?: string
): Promise<Employee> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Employee>>(
      getApiPath(`/employees/${id}`),
      payload,
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
