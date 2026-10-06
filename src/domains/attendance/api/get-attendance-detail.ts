import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Attendance } from '../types';

export async function getAttendanceDetail(id: string): Promise<Attendance> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Attendance>>(
      getApiPath(`/human-resource/attendances/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
