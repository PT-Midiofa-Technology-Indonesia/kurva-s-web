'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardFinanceSummary } from '../api/get-dashboard';
import type { DashboardFinanceSummary } from '../types';

export const DASHBOARD_FINANCE_SUMMARY_QUERY_KEY = {
  all: ['dashboard', 'finance-summary'] as const,
  byCompany: (companyId: string) =>
    [...DASHBOARD_FINANCE_SUMMARY_QUERY_KEY.all, companyId] as const,
};

export function useDashboardFinanceSummary(companyId?: string) {
  const companyKey = companyId ?? '__disabled__';

  return useQuery<DashboardFinanceSummary, unknown>({
    queryKey: DASHBOARD_FINANCE_SUMMARY_QUERY_KEY.byCompany(companyKey),
    queryFn: () => getDashboardFinanceSummary({ companyId: companyId ?? '' }),
    enabled: !!companyId,
  });
}
