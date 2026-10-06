'use client';

import { useMe } from '@/domains/auth';

/**
 * Isolated, swappable permission check for `manage_cost_request`.
 * Per the approved plan: no dedicated 403 page/redirect exists in this app —
 * callers render a restricted empty-state instead (see CostRequestListPage).
 * If the real backend mechanism turns out to be "branch on an API 403"
 * instead of a permissions array on /auth/me, only this hook needs to change.
 */
export function useCostRequestPermission() {
  const { data: me, isLoading } = useMe();

  return {
    canManage: me?.permissions?.includes('manage_cost_request') ?? false,
    isLoading,
  };
}
