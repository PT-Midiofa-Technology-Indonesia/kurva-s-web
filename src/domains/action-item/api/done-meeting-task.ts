import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { TaskControlRow } from '../types';
import type { MeetingTaskListApiResponse } from '../types/api';
import { mapMeetingTaskToRow } from './mappers';

export interface DoneMeetingTaskParams {
  id: string;
  companyId: string;
  /** Evidence files, sent as multipart `evidenceFiles[]`. */
  files: File[];
}

export async function doneMeetingTask({
  id,
  companyId,
  files,
}: DoneMeetingTaskParams): Promise<TaskControlRow> {
  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append('evidenceFiles[]', file);
    }

    const { data } = await api.post<ApiSuccessResponse<MeetingTaskListApiResponse>>(
      getApiPath(`/meeting-tasks/${id}/done`),
      formData,
      {
        headers: {
          'Content-Type': undefined,
          'X-Company-Id': companyId,
        },
      }
    );
    return mapMeetingTaskToRow(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
