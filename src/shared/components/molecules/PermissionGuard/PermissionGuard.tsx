'use client';

import type { ReactNode } from 'react';

import { useMe } from '@/domains/auth/hooks/use-me';

export interface PermissionGuardProps {
  requiredPermission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  requiredPermission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { data: user, isPending } = useMe();
  const permissions = user?.permissions ?? [];
  const requiredPermissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  if (isPending) {
    return fallback;
  }

  if (!requiredPermissions.some((permission) => permissions.includes(permission))) {
    return fallback;
  }

  return children;
}
