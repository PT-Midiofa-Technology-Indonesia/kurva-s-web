import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { PositionAssignment } from '../types';

export type SetPrimaryPositionAssignmentResponse = ApiResponse<PositionAssignment[]>;

export async function setPrimaryPositionAssignment(
  employeeId: string,
  positionAssignmentId: string
): Promise<SetPrimaryPositionAssignmentResponse | null> {
  try {
    const { data } = await api.patch<SetPrimaryPositionAssignmentResponse>(
      getApiPath(`/employee/${employeeId}/position-assignments/${positionAssignmentId}/is-primary`),
      { isPrimary: true }
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
