'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';

import type { UpdateProjectTypePayload } from '../api/update-project-type';
import { useProjectType } from './use-project-type';
import { PROJECT_TYPE_QUERY_KEYS } from './use-project-types';
import { useUpdateProjectType } from './use-update-project-type';

export function useEditProjectTypePage(projectTypeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: projectType, isLoading } = useProjectType(projectTypeId);
  const { mutate: updateProjectType, isPending } = useUpdateProjectType(projectTypeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateProjectTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/project-type');

  const handleBeforeSubmit = (payload: UpdateProjectTypePayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateProjectType(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROJECT_TYPE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: PROJECT_TYPE_QUERY_KEYS.detail(projectTypeId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/project-type');
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
    projectType,
    isLoading,
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
