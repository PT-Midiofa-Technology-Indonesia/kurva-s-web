import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';

export async function deleteEmployeeSalaryAdjustment(
  employeeId: string,
  companyId?: string | null
): Promise<void> {
  try {
    await api.delete<ApiResponse<null>>(
      getApiPath(`/human-resource/employee-salary-adjustments/${employeeId}`),
      { headers: { 'x-company-id': companyId ?? '' } }
    );
  } catch (error) {
    throw handleApiError(error);
  }
}
