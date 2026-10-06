import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { TaskControlDetail } from '../types';
import type { MeetingTaskDetailApiResponse } from '../types/api';
import { mapMeetingTaskToDetail } from './mappers';

export interface CancelMeetingTaskParams {
  id: string;
  companyId: string;
  /** Required, max 1000 characters per the API contract. */
  reason: string;
  /** Optional evidence, sent as multipart `evidenceFiles[]`. */
  files: File[];
}

export async function cancelMeetingTask({
  id,
  companyId,
  reason,
  files,
}: CancelMeetingTaskParams): Promise<TaskControlDetail> {
  try {
    const formData = new FormData();
    formData.append('reason', reason);
    for (const file of files) {
      formData.append('evidenceFiles[]', file);
    }

    const { data } = await api.post<ApiSuccessResponse<MeetingTaskDetailApiResponse>>(
      getApiPath(`/meeting-tasks/${id}/cancel`),
      formData,
      {
        headers: {
          'Content-Type': undefined,
          'X-Company-Id': companyId,
        },
      }
    );
    return mapMeetingTaskToDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
