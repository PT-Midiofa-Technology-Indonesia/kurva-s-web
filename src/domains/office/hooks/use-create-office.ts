'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import type { CreateOfficePayload } from '../api/create-office';
import { createOffice } from '../api/create-office';
import { OFFICE_QUERY_KEYS } from './use-offices';

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfficePayload) => createOffice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.lists() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.OFFICE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
