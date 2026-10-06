'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PROJECT_BOQ_QUERY_KEYS } from '@/domains/project-control/hooks/use-project-boq';
import { ENTITY_NAMES, TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { CreatePurchaseRequestBundlePayload } from '../api/create-purchase-request-bundle';
import { createPurchaseRequestBundle } from '../api/create-purchase-request-bundle';
import { PROCUREMENT_QUERY_KEYS } from './use-purchase-requests';

export function useCreatePurchaseRequestBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseRequestBundlePayload) =>
      createPurchaseRequestBundle(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROCUREMENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PROJECT_BOQ_QUERY_KEYS.detail(variables.projectId),
      });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED(ENTITY_NAMES.PURCHASE_REQUEST) });
    },
    onError: (error) => {
      toast.error({ title: getErrorMessage(error) });
    },
  });
}
