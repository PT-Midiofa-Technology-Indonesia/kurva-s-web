'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { CreateUserPayload } from '../api/create-user';
import { createUser } from '../api/create-user';
import { USER_QUERY_KEYS } from './use-users';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.USER) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
