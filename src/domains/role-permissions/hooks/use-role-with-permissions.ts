'use client';

import { useQueries } from '@tanstack/react-query';
import { getPermissionGroups } from '../api/get-permission-groups';
import { getRole } from '../api/get-role';
import type { RoleWithPermissions } from '../services/combine-role-with-permissions';
import { combineRoleWithPermissions } from '../services/combine-role-with-permissions';
import { PERMISSION_GROUP_QUERY_KEYS } from './use-permission-groups';
import { ROLE_QUERY_KEYS } from './use-roles';

export function useRoleWithPermissions(roleId: string, params?: { workspace?: string }) {
  const queries = useQueries({
    queries: [
      {
        queryKey: ROLE_QUERY_KEYS.detail(roleId),
        queryFn: async () => {
          const response = await getRole(roleId);
          return response?.data ?? null;
        },
        enabled: !!roleId,
      },
      {
        queryKey: PERMISSION_GROUP_QUERY_KEYS.list(params),
        queryFn: () => getPermissionGroups(params),
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
      },
    ],
  });

  const [roleQuery, permissionGroupsQuery] = queries;

  const isLoading = roleQuery.isLoading || permissionGroupsQuery.isLoading;
  const isError = roleQuery.isError || permissionGroupsQuery.isError;
  const error = roleQuery.error || permissionGroupsQuery.error;

  let data: RoleWithPermissions | null = null;

  if (roleQuery.data && permissionGroupsQuery.data) {
    data = combineRoleWithPermissions(roleQuery.data, permissionGroupsQuery.data);
  }

  return {
    data,
    isLoading,
    isError,
    error,
  };
}
