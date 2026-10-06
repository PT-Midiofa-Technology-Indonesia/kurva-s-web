import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PositionAssignment } from '../types';

export type GetEmployeePositionAssignmentsResponse = ApiResponse<PositionAssignment[]>;

export async function getEmployeePositionAssignments(
  employeeId: string,
  companyId?: string
): Promise<GetEmployeePositionAssignmentsResponse | null> {
  try {
    const { data } = await api.get<ApiResponse<PositionAssignment[]>>(
      getApiPath(`/employee/${employeeId}/position-assignments`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data;
  } catch (error: unknown) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    handleApiError(error);
  }
}
