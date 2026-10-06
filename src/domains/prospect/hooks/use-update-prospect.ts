'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import { updateProspect } from '../api/update-prospect';
import type { CreateProspectFormValues } from '../schemas';
import { PROSPECT_QUERY_KEYS } from './use-prospects';

export function useUpdateProspect(companyId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateProspectFormValues) =>
      updateProspect({
        companyId,
        projectId,
        title: values.title,
        clientName: values.clientName,
        estimatedValue: values.estimatedValue,
        projectStartDate: values.projectStartDate,
        projectEndDate: values.projectEndDate,
        description: values.description,
        projectTypeId: values.projectTypeId ?? null,
        projectCapabilityIds: values.projectCapabilityIds ?? [],
      }),
    onSuccess: () => {
      toast.success({ title: 'Prospect berhasil diupdate' });
      queryClient.invalidateQueries({ queryKey: PROSPECT_QUERY_KEYS.pipeline(companyId) });
    },
    onError: () => {
      toast.error({ title: 'Gagal mengupdate prospect' });
    },
  });
}
