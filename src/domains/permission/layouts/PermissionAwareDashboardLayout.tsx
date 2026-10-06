'use client';

import { usePermissionStore, useUserPermissions } from '@/domains/permission';
import { DashboardRouteLayout } from '@/shared/components/templates/DashboardRouteLayout';

interface Props {
  children: React.ReactNode;
}

/**
 * PermissionAwareDashboardLayout
 *
 * Bridges the permission domain with the shared DashboardRouteLayout.
 * useUserPermissions() handles: /me fetch → Zustand store → cookie sync.
 */
export function PermissionAwareDashboardLayout({ children }: Props) {
  useUserPermissions();

  const userPermissions = usePermissionStore((state) => state.permissions);

  return <DashboardRouteLayout userPermissions={userPermissions}>{children}</DashboardRouteLayout>;
}
