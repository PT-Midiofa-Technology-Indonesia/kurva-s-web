'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  type SetPoDraftItemWinnerItem,
  setPoDraftItemWinners,
} from '../api/set-po-draft-item-winner';
import { PO_DRAFT_QUERY_KEYS } from './use-po-draft-projects';

export interface WinnerSelection {
  itemId: string;
  vendorId: string;
}

export interface UseSetPoDraftItemWinnersOptions {
  companyId?: string;
}

export interface SetPoDraftItemWinnersVariables {
  draftId: string;
  selections: WinnerSelection[];
}

export function useSetPoDraftItemWinners(options?: UseSetPoDraftItemWinnersOptions) {
  const companyId = options?.companyId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, selections }: SetPoDraftItemWinnersVariables) => {
      const payload = {
        items: selections.map((s) => ({
          draftItemId: s.itemId,
          vendorId: s.vendorId,
        })) as SetPoDraftItemWinnerItem[],
      };
      return setPoDraftItemWinners(draftId, payload, companyId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PO_DRAFT_QUERY_KEYS.detail(variables.draftId) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
