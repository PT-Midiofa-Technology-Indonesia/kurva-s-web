import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { CreateEmployeeSalaryAdjustmentPayload } from '../types';

export async function createEmployeeSalaryAdjustment(
  payload: CreateEmployeeSalaryAdjustmentPayload & { companyId?: string | null }
): Promise<void> {
  try {
    const { companyId, ...body } = payload;
    await api.post<ApiResponse<null>>(
      getApiPath('/human-resource/employee-salary-adjustments'),
      body,
      { headers: { 'x-company-id': companyId ?? '' } }
    );
  } catch (error) {
    throw handleApiError(error);
  }
}
