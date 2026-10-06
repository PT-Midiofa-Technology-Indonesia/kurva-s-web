'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetQcTasksParams, getQcTasks } from '../api/get-qc-tasks';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

// Nested under MEETING_TASK_QUERY_KEYS.all on purpose: the QC tab reuses
// useDelegateMeetingTasks, which invalidates that root. A separate root would
// leave the QC table stale after a delegate.
export const QC_TASK_QUERY_KEYS = {
  lists: () => [...MEETING_TASK_QUERY_KEYS.all, 'qc-list'] as const,
  list: (params: GetQcTasksParams) => [...QC_TASK_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...MEETING_TASK_QUERY_KEYS.details(), 'qc', id] as const,
};

export function useQcTasks(params: GetQcTasksParams) {
  return useQuery({
    queryKey: QC_TASK_QUERY_KEYS.list(params),
    queryFn: () => getQcTasks(params),
    enabled: Boolean(params.companyId && params.meetingId),
    placeholderData: (previousData) => previousData,
  });
}
