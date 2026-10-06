'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { getFieldErrors } from '@/lib/api-error';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { CreateBillingFormValues } from '../schemas';
import { useSaveBillingInformation } from './use-save-billing-information';

type BillingCreateUrlParams = BaseQueryParams & {
  companyId?: string;
  projectId?: string;
};

export function useCreateBillingPage() {
  const router = useRouter();
  const { queryParams } = useQueryParams<BillingCreateUrlParams>();
  const companyId = queryParams.companyId ?? '';
  const projectId = queryParams.projectId ?? '';

  const { mutate: saveBillingInformation, isPending } = useSaveBillingInformation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateBillingFormValues | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const listUrl = `/finance/billings${companyId ? `?companyId=${companyId}` : ''}`;

  const handleCancel = () => {
    if (projectId) {
      router.push(`/finance/billings/${projectId}${companyId ? `?companyId=${companyId}` : ''}`);
      return;
    }

    router.push(listUrl);
  };

  const handleBeforeSubmit = (payload: CreateBillingFormValues) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;

    saveBillingInformation(
      {
        companyId,
        projectId: pendingPayload.projectId,
        billedAt: pendingPayload.billedAt,
        dueDate: pendingPayload.dueDate,
        notes: pendingPayload.notes,
      },
      {
        onSuccess: (response) => {
          const createdBillingId = response.data?.id;

          setIsDialogOpen(false);
          setPendingPayload(null);
          setServerErrors({});

          if (createdBillingId) {
            router.push(
              `/finance/billings/${pendingPayload.projectId}/create${companyId ? `?companyId=${companyId}&billingRecordId=${createdBillingId}` : `?billingRecordId=${createdBillingId}`}`
            );
            return;
          }

          router.push(listUrl);
        },
        onError: (error) => {
          const fieldErrors = getFieldErrors(error);
          if (fieldErrors) {
            setServerErrors(fieldErrors);
          }
          setIsDialogOpen(false);
        },
      }
    );
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
    companyId,
    projectId,
    handleCancel,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
