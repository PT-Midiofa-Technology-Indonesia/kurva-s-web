'use client';

import { useQuery } from '@tanstack/react-query';

import { type GetPermissionGroupsParams, getPermissionGroups } from '../api/get-permission-groups';

export const PERMISSION_GROUP_QUERY_KEYS = {
  all: ['permission-groups'] as const,
  list: (params?: GetPermissionGroupsParams) => ['permission-groups', params] as const,
};

export function usePermissionGroups(params?: GetPermissionGroupsParams) {
  return useQuery({
    queryKey: PERMISSION_GROUP_QUERY_KEYS.list(params),
    queryFn: () => getPermissionGroups(params),
    staleTime: 10 * 60 * 1000, // 10 minutes — permission groups rarely change
  });
}
