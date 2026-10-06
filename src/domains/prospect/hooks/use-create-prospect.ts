'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import { createProspect } from '../api/create-prospect';
import type { CreateProspectFormValues } from '../schemas';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useCreateProspect(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateProspectFormValues) =>
      createProspect({
        companyId,
        title: values.title,
        clientName: values.clientName,
        estimatedValue: values.estimatedValue,
        projectStartDate: values.projectStartDate,
        projectEndDate: values.projectEndDate,
        description: values.description,
        projectTypeId: values.projectTypeId ?? null,
        projectCapabilityIds: values.projectCapabilityIds ?? [],
        tenderSubmissionDeadline: null,
        outcomeReason: null,
      }),
    onSuccess: () => {
      toast.success({ title: 'Prospect berhasil ditambahkan' });
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId) });
    },
    onError: () => {
      toast.error({ title: 'Gagal menambahkan prospect' });
    },
  });
}
