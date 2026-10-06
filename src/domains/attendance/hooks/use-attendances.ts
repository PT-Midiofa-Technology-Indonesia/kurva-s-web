'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetAttendancesParams } from '../api/get-attendances';
import { getAttendances } from '../api/get-attendances';

export const ATTENDANCE_QUERY_KEYS = {
  all: ['attendances'] as const,
  lists: () => [...ATTENDANCE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ATTENDANCE_QUERY_KEYS.lists(), { filters }] as const,
};

export function useAttendances(params?: GetAttendancesParams) {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getAttendances(params),
  });
}
