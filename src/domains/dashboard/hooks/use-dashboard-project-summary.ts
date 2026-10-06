'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardProjectSummary } from '../api/get-dashboard';
import type { DashboardProjectSummary } from '../types';

export const DASHBOARD_PROJECT_SUMMARY_QUERY_KEY = {
  all: ['dashboard', 'project-summary'] as const,
  byCompany: (companyId: string) =>
    [...DASHBOARD_PROJECT_SUMMARY_QUERY_KEY.all, companyId] as const,
};

export function useDashboardProjectSummary(companyId?: string) {
  const companyKey = companyId ?? '__disabled__';

  return useQuery<DashboardProjectSummary, unknown>({
    queryKey: DASHBOARD_PROJECT_SUMMARY_QUERY_KEY.byCompany(companyKey),
    queryFn: () => getDashboardProjectSummary({ companyId: companyId ?? '' }),
    enabled: !!companyId,
  });
}
