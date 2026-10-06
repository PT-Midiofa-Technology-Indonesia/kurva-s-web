'use client';

import { useQuery } from '@tanstack/react-query';

import { getProjectType } from '../api/get-project-type';
import { PROJECT_TYPE_QUERY_KEYS } from './use-project-types';

export function useProjectType(projectTypeId: string) {
  return useQuery({
    queryKey: PROJECT_TYPE_QUERY_KEYS.detail(projectTypeId),
    queryFn: () => getProjectType(projectTypeId),
    enabled: !!projectTypeId,
    select: (data) => (data ? data.data : null),
  });
}
