import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse, PaginationMeta } from '@/types/api';
import type { QcTaskRow } from '../types';
import type { MeetingTaskApiStatus, QcDecisionApi, QcTaskApiResponse } from '../types/api';
import { mapQcTaskToRow } from './mappers';

export type QcTaskSortBy =
  | 'code'
  | 'qcTask'
  | 'project'
  | 'qcAssignee'
  | 'qcAt'
  | 'doneAt'
  | 'decision'
  | 'retryCount'
  | 'status';

export interface GetQcTasksParams {
  /** Sent as the X-Company-Id header, never as a query param. */
  companyId: string;
  meetingId: string;
  status?: MeetingTaskApiStatus;
  qcDecision?: QcDecisionApi;
  search?: string;
  sortBy?: QcTaskSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface GetQcTasksResult {
  rows: QcTaskRow[];
  meta: PaginationMeta;
}

export async function getQcTasks({
  companyId,
  ...params
}: GetQcTasksParams): Promise<GetQcTasksResult> {
  try {
    const { data } = await api.get<ApiPaginatedResponse<QcTaskApiResponse[]>>(
      getApiPath('/meeting-tasks/quality-controls'),
      {
        params,
        headers: { 'X-Company-Id': companyId },
      }
    );
    return {
      rows: data.data.map(mapQcTaskToRow),
      meta: data.meta,
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
