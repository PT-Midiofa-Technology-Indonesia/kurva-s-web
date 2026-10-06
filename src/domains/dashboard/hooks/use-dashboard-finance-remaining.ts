'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardFinanceRemaining } from '../api/get-dashboard';
import type { DashboardFinanceRemaining } from '../types';

export const DASHBOARD_FINANCE_REMAINING_QUERY_KEY = {
  all: ['dashboard', 'finance-remaining'] as const,
  byCompany: (companyId: string) =>
    [...DASHBOARD_FINANCE_REMAINING_QUERY_KEY.all, companyId] as const,
};

export function useDashboardFinanceRemaining(companyId?: string) {
  const companyKey = companyId ?? '__disabled__';

  return useQuery<DashboardFinanceRemaining, unknown>({
    queryKey: DASHBOARD_FINANCE_REMAINING_QUERY_KEY.byCompany(companyKey),
    queryFn: () => getDashboardFinanceRemaining({ companyId: companyId ?? '' }),
    enabled: !!companyId,
  });
}
