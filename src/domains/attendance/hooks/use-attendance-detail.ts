'use client';

import { useQuery } from '@tanstack/react-query';
import { getAttendanceDetail } from '../api/get-attendance-detail';
import { ATTENDANCE_QUERY_KEYS } from './use-attendances';

export function useAttendanceDetail(id: string | null) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEYS.all, 'detail', id],
    queryFn: () => getAttendanceDetail(id!),
    enabled: !!id,
  });
}
