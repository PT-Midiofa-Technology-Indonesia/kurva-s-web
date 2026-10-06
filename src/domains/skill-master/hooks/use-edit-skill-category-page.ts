'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { SkillCategoryFormData } from '../schemas';
import { SKILL_CATEGORY_QUERY_KEYS } from './use-skill-categories';
import { useSkillCategory } from './use-skill-category';
import { useUpdateSkillCategory } from './use-update-skill-category';

export function useEditSkillCategoryPage(skillCategoryId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  const { data: skillCategory, isPending: isLoading } = useSkillCategory(skillCategoryId);
  const { mutate: updateSkillCategory, isPending } = useUpdateSkillCategory(skillCategoryId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<SkillCategoryFormData | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const getBackUrl = () => {
    const baseUrl = '/master-data/skill-master';
    return tab ? `${baseUrl}?tab=${tab}` : baseUrl;
  };

  const handleCancel = () => router.push(getBackUrl());

  const handleBeforeSubmit = (payload: SkillCategoryFormData) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateSkillCategory(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: SKILL_CATEGORY_QUERY_KEYS.detail(skillCategoryId),
        });
        queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push(getBackUrl());
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  };

  return {
    skillCategory,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    isLoading,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
