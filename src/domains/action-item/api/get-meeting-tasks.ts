import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse, PaginationMeta } from '@/types/api';
import type { TaskControlRow } from '../types';
import type { MeetingTaskApiStatus, MeetingTaskListApiResponse } from '../types/api';
import { mapMeetingTaskToRow } from './mappers';

export type MeetingTaskSortBy =
  | 'code'
  | 'task'
  | 'project'
  | 'assignee'
  | 'doneAt'
  | 'retryCount'
  | 'status'
  | 'createdAt';

export interface GetMeetingTasksParams {
  /** Sent as the X-Company-Id header, never as a query param. */
  companyId: string;
  meetingId: string;
  status?: MeetingTaskApiStatus;
  search?: string;
  sortBy?: MeetingTaskSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface GetMeetingTasksResult {
  rows: TaskControlRow[];
  meta: PaginationMeta;
}

export async function getMeetingTasks({
  companyId,
  ...params
}: GetMeetingTasksParams): Promise<GetMeetingTasksResult> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<MeetingTaskListApiResponse[]>>(
      getApiPath('/meeting-tasks/tasks'),
      {
        params,
        headers: { 'X-Company-Id': companyId },
      }
    );
    return {
      rows: data.data.map(mapMeetingTaskToRow),
      meta: data.meta,
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
