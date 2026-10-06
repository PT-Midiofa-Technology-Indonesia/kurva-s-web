'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateJobItemTypePayload } from '../api/update-job-item-type';
import { useJobItemType } from './use-job-item-type';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';
import { useUpdateJobItemType } from './use-update-job-item-type';

export function useEditJobItemTypePage(jobItemTypeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: jobItemType, isLoading } = useJobItemType(jobItemTypeId);
  const { mutate: updateJobItemType, isPending } = useUpdateJobItemType(jobItemTypeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateJobItemTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/job-item-type');

  const handleBeforeSubmit = (payload: UpdateJobItemTypePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateJobItemType(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: JOB_ITEM_TYPE_QUERY_KEYS.detail(jobItemTypeId) });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/job-item-type');
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
    jobItemType,
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
