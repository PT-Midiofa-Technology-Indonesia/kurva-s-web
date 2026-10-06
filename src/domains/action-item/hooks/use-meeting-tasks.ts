'use client';

import { useQuery } from '@tanstack/react-query';
import { type GetMeetingTasksParams, getMeetingTasks } from '../api/get-meeting-tasks';

export const MEETING_TASK_QUERY_KEYS = {
  all: ['meeting-tasks'] as const,
  lists: () => [...MEETING_TASK_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetMeetingTasksParams) => [...MEETING_TASK_QUERY_KEYS.lists(), params] as const,
  details: () => [...MEETING_TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MEETING_TASK_QUERY_KEYS.details(), id] as const,
};

export function useMeetingTasks(params: GetMeetingTasksParams) {
  return useQuery({
    queryKey: MEETING_TASK_QUERY_KEYS.list(params),
    queryFn: () => getMeetingTasks(params),
    enabled: Boolean(params.companyId && params.meetingId),
    placeholderData: (previousData) => previousData,
  });
}
