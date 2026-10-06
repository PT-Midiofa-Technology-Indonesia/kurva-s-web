'use client';

import { useQuery } from '@tanstack/react-query';

import { getDashboardProjectOverview } from '../api/get-dashboard';
import type { DashboardProjectOverview, SCurvePeriodMode } from '../types';

export const DASHBOARD_PROJECT_OVERVIEW_QUERY_KEY = {
  all: ['dashboard', 'project-overview'] as const,
  byProject: (projectId: string, interval: SCurvePeriodMode) =>
    [...DASHBOARD_PROJECT_OVERVIEW_QUERY_KEY.all, projectId, interval] as const,
};

interface UseDashboardProjectOverviewParams {
  projectId?: string;
  interval: SCurvePeriodMode;
}

export function useDashboardProjectOverview({
  projectId,
  interval,
}: UseDashboardProjectOverviewParams) {
  const projectKey = projectId ?? '__disabled__';

  return useQuery<DashboardProjectOverview, unknown>({
    queryKey: DASHBOARD_PROJECT_OVERVIEW_QUERY_KEY.byProject(projectKey, interval),
    queryFn: () => getDashboardProjectOverview({ projectId, interval }),
    enabled: !!projectId,
  });
}
