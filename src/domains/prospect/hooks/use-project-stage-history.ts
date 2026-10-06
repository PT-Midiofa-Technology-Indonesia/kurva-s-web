'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectStageHistory } from '../api/get-project-stage-history';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useProjectStageHistory(projectId: string | null) {
  return useQuery({
    queryKey: PROSPECT_QUERY_KEYS.stageHistory(projectId ?? ''),
    queryFn: () => getProjectStageHistory(projectId!),
    enabled: !!projectId,
  });
}
