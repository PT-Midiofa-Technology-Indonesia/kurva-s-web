import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { EmployeeSalaryAdjustmentDetail } from '../types';

export async function getEmployeeSalaryAdjustmentDetail(
  employeeId: string,
  companyId?: string | null
): Promise<EmployeeSalaryAdjustmentDetail> {
  try {
    const response = await api.get<ApiResponse<EmployeeSalaryAdjustmentDetail>>(
      getApiPath(`/human-resource/employee-salary-adjustments/${employeeId}`),
      {
        headers: { 'x-company-id': companyId ?? '' },
      }
    );
    return response.data.data as EmployeeSalaryAdjustmentDetail;
  } catch (error) {
    throw handleApiError(error);
  }
}
