'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardKpiSummary } from '../api/get-dashboard';
import type { DashboardKpiSummary } from '../types';

export const DASHBOARD_KPI_SUMMARY_QUERY_KEY = {
  all: ['dashboard', 'kpi-summary'] as const,
  byCompany: (companyId: string) => [...DASHBOARD_KPI_SUMMARY_QUERY_KEY.all, companyId] as const,
};

export function useDashboardKpiSummary(companyId?: string) {
  const companyKey = companyId ?? '__disabled__';

  return useQuery<DashboardKpiSummary, unknown>({
    queryKey: DASHBOARD_KPI_SUMMARY_QUERY_KEY.byCompany(companyKey),
    queryFn: () => getDashboardKpiSummary({ companyId: companyId ?? '' }),
    enabled: !!companyId,
  });
}
