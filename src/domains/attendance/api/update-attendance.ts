import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Attendance, UpdateAttendancePayload } from '../types';

export interface UpdateAttendanceParams {
  id: string;
  companyId: string;
  payload: UpdateAttendancePayload;
}

export async function updateAttendance({
  id,
  companyId,
  payload,
}: UpdateAttendanceParams): Promise<Attendance> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Attendance>>(
      getApiPath(`/human-resource/attendances/${id}`),
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
