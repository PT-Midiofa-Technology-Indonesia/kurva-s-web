import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { TaskControlDetail } from '../types';
import type { MeetingTaskDetailApiResponse } from '../types/api';
import { mapMeetingTaskToDetail } from './mappers';

export interface GetMeetingTaskParams {
  id: string;
  companyId: string;
}

export async function getMeetingTask({
  id,
  companyId,
}: GetMeetingTaskParams): Promise<TaskControlDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<MeetingTaskDetailApiResponse>>(
      getApiPath(`/meeting-tasks/${id}`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapMeetingTaskToDetail(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
