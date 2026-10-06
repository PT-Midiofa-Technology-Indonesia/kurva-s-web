'use client';

import { useEffect } from 'react';

import { useMe } from '@/domains/auth/hooks/use-me';
import {
  clearUserPermissionsCookie,
  saveUserPermissionsToCookie,
} from '@/shared/lib/user-permissions';

import { usePermissionStore } from '../store';

/**
 * Hook to sync user permissions from /me into Zustand store and permissions cookie.
 * Cookie sync enables server-side permission checks in proxy.ts.
 * Returns the useMe query so callers can observe loading/error state.
 */
export function useUserPermissions() {
  const setPermissions = usePermissionStore((s) => s.setPermissions);
  const query = useMe();

  useEffect(() => {
    if (query.data) {
      setPermissions({
        userId: query.data.id,
        permissions: query.data.permissions,
        roles: query.data.roles.map((r) => r.name),
      });
      saveUserPermissionsToCookie(query.data.permissions ?? []);
    } else if (query.isError) {
      clearUserPermissionsCookie();
    }
  }, [query.data, query.isError, setPermissions]);

  return query;
}
