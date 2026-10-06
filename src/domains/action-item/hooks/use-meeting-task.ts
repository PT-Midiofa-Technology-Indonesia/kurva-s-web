'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetMeetingTaskParams, getMeetingTask } from '../api/get-meeting-task';
import { MEETING_TASK_QUERY_KEYS } from './use-meeting-tasks';

export function useMeetingTask(params: Partial<GetMeetingTaskParams>) {
  return useQuery({
    queryKey: MEETING_TASK_QUERY_KEYS.detail(params.id ?? ''),
    queryFn: () => getMeetingTask({ id: params.id!, companyId: params.companyId! }),
    enabled: Boolean(params.id && params.companyId),
  });
}
