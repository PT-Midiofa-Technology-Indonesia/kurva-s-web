'use client';

import { useQuery } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import type { GetRolesParams } from '../api/get-roles';
import { getRoles } from '../api/get-roles';

export const ROLE_QUERY_KEYS = {
  all: ['roles'] as const,
  lists: () => [...ROLE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ROLE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ROLE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ROLE_QUERY_KEYS.details(), id] as const,
  infinite: () => ['roles-infinite'] as const,
};

export interface UseRolesOptions {
  params?: GetRolesParams;
  enabled?: boolean;
}

export function useRoles(options?: UseRolesOptions) {
  const params = options?.params;
  return useQuery({
    queryKey: [...ROLE_QUERY_KEYS.all, params],
    queryFn: () => getRoles(params),
    enabled: options?.enabled !== false,
    placeholderData: (previousData) => previousData,
  });
}

export function useRolesWithMessage(options?: UseRolesOptions) {
  const query = useRoles(options);
  return {
    ...query,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  };
}
