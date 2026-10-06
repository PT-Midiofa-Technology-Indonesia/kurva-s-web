'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { finalizePoDraft } from '../api/finalize-po-draft';
import type { FinalizePoDraftPayload } from '../types/api';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';
import { PROCUREMENT_QUERY_KEYS } from './use-po-drafts';

export interface UseFinalizePoDraftOptions {
  companyId: string;
}

export interface FinalizePoDraftVariables {
  draftId: string;
  payload: FinalizePoDraftPayload;
}

export function useFinalizePoDraft({ companyId }: UseFinalizePoDraftOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, payload }: FinalizePoDraftVariables) =>
      finalizePoDraft({ id: draftId, companyId, payload }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PO_DRAFT_QUERY_KEYS.detail(variables.draftId) });
      toast.success({
        title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.PURCHASE_PLANNING),
      });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
