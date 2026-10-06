'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

import type { UpdateOfficePayload } from '../api/update-office';
import { updateOffice } from '../api/update-office';
import { OFFICE_QUERY_KEYS } from './use-offices';

export function useUpdateOffice(officeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOfficePayload) => updateOffice(officeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: OFFICE_QUERY_KEYS.detail(officeId) });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.OFFICE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
