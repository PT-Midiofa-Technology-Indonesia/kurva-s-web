'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateGroupPayload } from '../api/update-group';
import { useGroup } from './use-group';
import { GROUP_QUERY_KEYS } from './use-groups';
import { useUpdateGroup } from './use-update-group';

export function useEditGroupPage(groupId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: group, isLoading } = useGroup(groupId);
  const { mutate: updateGroup, isPending } = useUpdateGroup(groupId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateGroupPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/organization/group');

  const handleBeforeSubmit = (payload: UpdateGroupPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateGroup(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.detail(groupId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/organization/group');
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
    group,
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
