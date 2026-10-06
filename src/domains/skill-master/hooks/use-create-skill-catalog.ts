'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createSkillCatalog } from '../api/create-skill-catalog';
import { SKILL_CATALOG_QUERY_KEYS } from './use-skill-catalogs';

export function useCreateSkillCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSkillCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Skill Catalog') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
