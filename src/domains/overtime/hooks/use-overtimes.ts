'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetOvertimesParams } from '../api/get-overtimes';
import { getOvertimes } from '../api/get-overtimes';

export const OVERTIME_QUERY_KEYS = {
  all: ['overtimes'] as const,
  lists: () => [...OVERTIME_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...OVERTIME_QUERY_KEYS.lists(), { filters }] as const,
};

export function useOvertimes(params?: GetOvertimesParams) {
  return useQuery({
    queryKey: OVERTIME_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getOvertimes(params),
  });
}
