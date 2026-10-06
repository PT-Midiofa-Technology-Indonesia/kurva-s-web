'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { UpdateProspectStagePayload } from '../api/update-prospect-stage';
import { updateProspectStage } from '../api/update-prospect-stage';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useUpdateProspectStage(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProspectStagePayload) => updateProspectStage(payload, companyId),
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId) });
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.detail(variables.projectId) });
      queryClient.invalidateQueries({
        queryKey: PROSPECT_QUERY_KEYS.stageHistory(variables.projectId),
      });
    },
  });
}
