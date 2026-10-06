import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface DeleteOvertimeParams {
  id: string;
  companyId: string;
}

export async function deleteOvertime({ id, companyId }: DeleteOvertimeParams): Promise<void> {
  try {
    await api.delete(getApiPath(`/human-resource/overtimes/${id}`), {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
