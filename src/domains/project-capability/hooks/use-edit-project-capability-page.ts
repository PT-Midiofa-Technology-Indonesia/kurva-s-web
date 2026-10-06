'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';

import type { UpdateProjectCapabilityPayload } from '../api/update-project-capability';
import { PROJECT_CAPABILITY_QUERY_KEYS } from './use-project-capabilities';
import { useProjectCapability } from './use-project-capability';
import { useUpdateProjectCapability } from './use-update-project-capability';

export function useEditProjectCapabilityPage(projectCapabilityId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: projectCapability, isLoading } = useProjectCapability(projectCapabilityId);
  const { mutate: updateProjectCapability, isPending } =
    useUpdateProjectCapability(projectCapabilityId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateProjectCapabilityPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/project-capability');

  const handleBeforeSubmit = (payload: UpdateProjectCapabilityPayload) => {
    setServerErrors({});
    setPendingPayload(payload);
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateProjectCapability(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: PROJECT_CAPABILITY_QUERY_KEYS.detail(projectCapabilityId),
        });
        queryClient.invalidateQueries({ queryKey: PROJECT_CAPABILITY_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/project-capability');
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
    projectCapability,
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
