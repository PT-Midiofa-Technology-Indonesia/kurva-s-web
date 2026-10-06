'use client';

import { useQuery } from '@tanstack/react-query';

import { getProjectCapability } from '../api/get-project-capability';
import { PROJECT_CAPABILITY_QUERY_KEYS } from './use-project-capabilities';

export function useProjectCapability(projectCapabilityId: string) {
  return useQuery({
    queryKey: PROJECT_CAPABILITY_QUERY_KEYS.detail(projectCapabilityId),
    queryFn: () => getProjectCapability(projectCapabilityId),
    enabled: !!projectCapabilityId,
    select: (data) => (data ? data.data : null),
  });
}
