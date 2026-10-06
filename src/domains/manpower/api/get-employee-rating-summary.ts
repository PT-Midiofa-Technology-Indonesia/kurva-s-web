import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { EmployeeRatingSummary } from '../types';

export interface GetEmployeeRatingSummaryParams {
  employeeId: string;
  showAll?: boolean;
}

export type GetEmployeeRatingSummaryResponse = ApiSuccessResponse<EmployeeRatingSummary>;

export async function getEmployeeRatingSummary(
  params: GetEmployeeRatingSummaryParams
): Promise<GetEmployeeRatingSummaryResponse> {
  const { employeeId, showAll = false } = params;

  try {
    const { data } = await api.get<GetEmployeeRatingSummaryResponse>(
      getApiPath(`/employees/${employeeId}/ratings/summary`),
      {
        params: {
          showAll,
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
