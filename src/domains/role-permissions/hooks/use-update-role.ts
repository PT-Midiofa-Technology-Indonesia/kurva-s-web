import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';

import type { CreateRolePayload } from '../api/create-role';
import { updateRole } from '../api/update-role';
import { ROLE_QUERY_KEYS } from './use-roles';

export const useUpdateRole = (roleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => updateRole(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED(ENTITY_NAMES.ROLE) });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
};
