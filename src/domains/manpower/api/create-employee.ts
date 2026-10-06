import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Employee } from '../types';

export interface CreateEmployeePayload {
  fullName: string;
  employeeType: string;
  isActive?: boolean;
  gender: string;
  birthPlace: string;
  birthDate: string;
  phone: string;
  email: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  villageId?: string;
  postalCode?: string;
  addressDetail?: string;
  nik?: string;
  npwp?: string;
  contractType?: string;
  salaryType?: string;
  workPlacement?: string | null;
  hireDate?: string;
}

export async function createEmployee(
  payload: CreateEmployeePayload,
  companyId?: string
): Promise<Employee> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Employee>>(
      getApiPath('/employees'),
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
