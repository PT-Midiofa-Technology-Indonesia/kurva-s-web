'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createSkillCategory } from '../api/create-skill-category';
import { SKILL_CATEGORY_QUERY_KEYS } from './use-skill-categories';

export function useCreateSkillCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSkillCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Skill Category') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
