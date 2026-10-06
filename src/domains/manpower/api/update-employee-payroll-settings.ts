import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Employee, UpdateEmployeePayrollSettingsPayload } from '../types';

export async function updateEmployeePayrollSettings(
  employeeId: string,
  payload: UpdateEmployeePayrollSettingsPayload,
  companyId?: string
): Promise<Employee> {
  try {
    const { data } = await api.patch<ApiSuccessResponse<Employee>>(
      getApiPath(`/employees/${employeeId}/payroll-settings`),
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
