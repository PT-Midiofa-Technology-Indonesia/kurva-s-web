'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { SkillCategoryFormData } from '../schemas';
import { useCreateSkillCategory } from './use-create-skill-category';

export function useCreateSkillCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  const { mutate: createSkillCategory, isPending } = useCreateSkillCategory();
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
    createSkillCategory(pendingPayload, {
      onSuccess: () => {
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
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
