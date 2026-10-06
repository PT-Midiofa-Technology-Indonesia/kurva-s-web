import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface CancelOvertimeParams {
  id: string;
  companyId: string;
}

export async function cancelOvertime({ id, companyId }: CancelOvertimeParams): Promise<void> {
  try {
    await api.post(
      getApiPath(`/human-resource/overtimes/${id}/cancel`),
      {},
      {
        headers: { 'X-Company-Id': companyId },
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
