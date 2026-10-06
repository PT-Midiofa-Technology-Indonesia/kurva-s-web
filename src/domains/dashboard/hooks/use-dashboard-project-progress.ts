'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardProjectProgress } from '../api/get-dashboard';
import type { DashboardProjectProgress } from '../types';

export const DASHBOARD_PROJECT_PROGRESS_QUERY_KEY = {
  all: ['dashboard', 'project-progress'] as const,
  byCompany: (companyId: string) =>
    [...DASHBOARD_PROJECT_PROGRESS_QUERY_KEY.all, companyId] as const,
};

export function useDashboardProjectProgress(companyId?: string) {
  const companyKey = companyId ?? '__disabled__';

  return useQuery<DashboardProjectProgress, unknown>({
    queryKey: DASHBOARD_PROJECT_PROGRESS_QUERY_KEY.byCompany(companyKey),
    queryFn: () => getDashboardProjectProgress({ companyId: companyId ?? '' }),
    enabled: !!companyId,
  });
}
