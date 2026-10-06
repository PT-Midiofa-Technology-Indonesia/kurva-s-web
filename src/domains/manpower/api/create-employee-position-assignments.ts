import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface CreatePositionAssignmentsPayload {
  companyPositionId: string[];
}

export async function createEmployeePositionAssignments(
  employeeId: string,
  payload: CreatePositionAssignmentsPayload,
  companyId?: string
): Promise<void> {
  try {
    await api.post<ApiSuccessResponse<void>>(
      getApiPath(`/employee/${employeeId}/position-assignments`),
      payload,
      {
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
