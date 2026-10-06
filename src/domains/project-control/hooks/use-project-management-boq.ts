'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProjectBOQMonitoringTime } from '../api/get-project-boq';
import { getProjectManagementBOQ } from '../api/get-project-management-boq';

export const PROJECT_MANAGEMENT_BOQ_QUERY_KEYS = {
  all: ['project-management-boq'] as const,
  detail: (projectId: string, monitoringTime?: ProjectBOQMonitoringTime) =>
    [...PROJECT_MANAGEMENT_BOQ_QUERY_KEYS.all, projectId, monitoringTime ?? 'all'] as const,
} as const;

interface UseProjectManagementBOQOptions {
  enabled?: boolean;
}

/**
 * `projectId` is not part of the URL — it travels as the `x-project-id` header — but it
 * still keys the cache so switching project never serves another project's BOQ.
 */
export function useProjectManagementBOQ(
  projectId: string | null | undefined,
  monitoringTime?: ProjectBOQMonitoringTime,
  options?: UseProjectManagementBOQOptions
) {
  return useQuery({
    queryKey: PROJECT_MANAGEMENT_BOQ_QUERY_KEYS.detail(projectId ?? '', monitoringTime),
    queryFn: () => getProjectManagementBOQ(monitoringTime),
    enabled: !!projectId && options?.enabled !== false,
  });
}
