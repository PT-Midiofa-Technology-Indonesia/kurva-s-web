'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { updateSkillCategory } from '../api/update-skill-category';
import type { SkillCategoryFormData } from '../schemas';
import { SKILL_CATEGORY_QUERY_KEYS } from './use-skill-categories';

export function useUpdateSkillCategory(skillCategoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SkillCategoryFormData) => updateSkillCategory(skillCategoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: SKILL_CATEGORY_QUERY_KEYS.detail(skillCategoryId),
      });
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Skill Category') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
