import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type {
  EmployeeSalaryAdjustmentDetail,
  UpdateEmployeeSalaryAdjustmentPayload,
} from '../types';

export async function updateEmployeeSalaryAdjustment(
  employeeId: string,
  payload: UpdateEmployeeSalaryAdjustmentPayload & { companyId?: string | null }
): Promise<EmployeeSalaryAdjustmentDetail> {
  try {
    const { companyId, ...body } = payload;
    const response = await api.put<ApiResponse<EmployeeSalaryAdjustmentDetail>>(
      getApiPath(`/human-resource/employee-salary-adjustments/${employeeId}`),
      body,
      { headers: { 'x-company-id': companyId ?? '' } }
    );
    return response.data.data as EmployeeSalaryAdjustmentDetail;
  } catch (error) {
    throw handleApiError(error);
  }
}
