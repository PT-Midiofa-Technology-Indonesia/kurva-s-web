'use client';

import { useQuery } from '@tanstack/react-query';

import { getGroup } from '../api/get-group';
import { GROUP_QUERY_KEYS } from './use-groups';

export function useGroup(id: string) {
  return useQuery({
    queryKey: GROUP_QUERY_KEYS.detail(id),
    queryFn: () => getGroup(id),
    enabled: !!id,
    select: (data) => (data ? data : null),
  });
}
