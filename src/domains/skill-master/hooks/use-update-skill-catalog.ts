'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { updateSkillCatalog } from '../api/update-skill-catalog';
import type { SkillCatalogFormData } from '../schemas';
import { SKILL_CATALOG_QUERY_KEYS } from './use-skill-catalogs';

export function useUpdateSkillCatalog(skillCatalogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SkillCatalogFormData) => updateSkillCatalog(skillCatalogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.detail(skillCatalogId) });
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Skill Catalog') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
