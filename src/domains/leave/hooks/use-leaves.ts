'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetLeavesParams } from '../api/get-leaves';
import { getLeaves } from '../api/get-leaves';

export const LEAVE_QUERY_KEYS = {
  all: ['leaves'] as const,
  lists: () => [...LEAVE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...LEAVE_QUERY_KEYS.lists(), { filters }] as const,
};

export interface UseLeavesOptions extends GetLeavesParams {
  enabled?: boolean;
}

export function useLeaves(options?: UseLeavesOptions) {
  const { enabled = true, ...params } = options ?? {};

  return useQuery({
    queryKey: LEAVE_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getLeaves(params),
    enabled,
  });
}
