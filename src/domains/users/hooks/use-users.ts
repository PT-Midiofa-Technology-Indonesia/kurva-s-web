'use client';

import { useQuery } from '@tanstack/react-query';

import type { GetUsersParams } from '../api/get-users';
import { getUsers } from '../api/get-users';

export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...USER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  infinite: () => ['employees-infinite'] as const,
};

export interface UseUsersOptions {
  params?: GetUsersParams;
  enabled?: boolean;
}

export function useUsers(options?: UseUsersOptions) {
  const params = options?.params;
  return useQuery({
    queryKey: [...USER_QUERY_KEYS.all, params],
    queryFn: () => getUsers(params),
    enabled: options?.enabled !== false,
    placeholderData: (previousData) => previousData,
  });
}
