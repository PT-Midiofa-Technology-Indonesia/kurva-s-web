'use client';

import { useQuery } from '@tanstack/react-query';
import { getPerformanceDetail } from '../api/get-performance-detail';
import { PERFORMANCE_QUERY_KEYS } from './use-performance-employees';

export function usePerformanceDetail(performanceId: string) {
  return useQuery({
    queryKey: PERFORMANCE_QUERY_KEYS.detail(performanceId),
    queryFn: () => getPerformanceDetail(performanceId),
    enabled: !!performanceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
