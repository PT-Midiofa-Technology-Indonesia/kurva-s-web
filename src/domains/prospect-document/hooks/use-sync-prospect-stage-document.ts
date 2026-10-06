'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { syncProspectStageDocument } from '../api/sync-prospect-stage-document';
import { ENTITY_NAMES_PROSPECT_DOCUMENT } from '../constants';
import type { SyncProspectStageDocumentPayload } from '../types';
import { PROSPECT_DOCUMENT_QUERY_KEYS } from './use-prospect-stage-documents';

export function useSyncProspectStageDocument(stage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncProspectStageDocumentPayload) =>
      syncProspectStageDocument(stage, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROSPECT_DOCUMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROSPECT_DOCUMENT_QUERY_KEYS.byStage(stage) });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED(
          ENTITY_NAMES_PROSPECT_DOCUMENT.PROSPECT_STAGE_DOCUMENT
        ),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
