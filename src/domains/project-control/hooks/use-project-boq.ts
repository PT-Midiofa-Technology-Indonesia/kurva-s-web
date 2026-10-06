'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectBOQ, type ProjectBOQMonitoringTime } from '../api/get-project-boq';

export const PROJECT_BOQ_QUERY_KEYS = {
  all: ['project-boq'] as const,
  detail: (projectId: string, monitoringTime?: ProjectBOQMonitoringTime) =>
    [...PROJECT_BOQ_QUERY_KEYS.all, projectId, monitoringTime ?? 'all'] as const,
} as const;

export function useProjectBOQ(
  projectId: string | null | undefined,
  monitoringTime?: ProjectBOQMonitoringTime
) {
  return useQuery({
    queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId ?? '', monitoringTime),
    queryFn: () => getProjectBOQ(projectId!, monitoringTime),
    enabled: !!projectId,
  });
}
