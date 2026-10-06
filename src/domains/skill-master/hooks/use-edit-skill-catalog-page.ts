'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { SkillCatalogFormData } from '../schemas';
import { useSkillCatalog } from './use-skill-catalog';
import { SKILL_CATALOG_QUERY_KEYS } from './use-skill-catalogs';
import { useUpdateSkillCatalog } from './use-update-skill-catalog';

export function useEditSkillCatalogPage(skillCatalogId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  const { data: skillCatalog, isPending: isLoading } = useSkillCatalog(skillCatalogId);
  const { mutate: updateSkillCatalogMutation, isPending } = useUpdateSkillCatalog(skillCatalogId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<SkillCatalogFormData | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const getBackUrl = () => {
    const baseUrl = '/master-data/skill-master';
    return tab ? `${baseUrl}?tab=${tab}` : baseUrl;
  };

  const handleCancel = () => router.push(getBackUrl());

  const handleBeforeSubmit = (payload: SkillCatalogFormData) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateSkillCatalogMutation(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: SKILL_CATALOG_QUERY_KEYS.detail(skillCatalogId),
        });
        queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.infinite() });
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
    skillCatalog,
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
