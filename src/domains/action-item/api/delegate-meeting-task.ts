import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { TaskControlRow } from '../types';
import type { MeetingTaskListApiResponse } from '../types/api';
import { mapMeetingTaskToRow } from './mappers';

export interface DelegateMeetingTaskParams {
  id: string;
  employeeId: string;
  companyId: string;
}

export async function delegateMeetingTask({
  id,
  employeeId,
  companyId,
}: DelegateMeetingTaskParams): Promise<TaskControlRow> {
  try {
    const { data } = await api.post<ApiSuccessResponse<MeetingTaskListApiResponse>>(
      getApiPath(`/meeting-tasks/${id}/delegate`),
      { employeeId },
      { headers: { 'X-Company-Id': companyId } }
    );
    return mapMeetingTaskToRow(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
