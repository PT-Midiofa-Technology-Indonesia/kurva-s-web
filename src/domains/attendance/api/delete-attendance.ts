import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeleteAttendanceParams {
  id: string;
  companyId: string;
}

export async function deleteAttendance({ id, companyId }: DeleteAttendanceParams): Promise<void> {
  try {
    await api.delete(getApiPath(`/human-resource/attendances/${id}`), {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
