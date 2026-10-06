'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import type { UpdatePositionPayload } from '../api/update-position';
import { updatePosition } from '../api/update-position';
import { POSITION_QUERY_KEYS } from './use-positions';

export function useUpdatePosition(positionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePositionPayload) => updatePosition(positionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.detail(positionId) });
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.POSITION) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
