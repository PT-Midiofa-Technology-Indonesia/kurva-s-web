'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';
import { useQueryParams } from '@/shared/hooks/use-query-params';

import type { CreateEmployeePayload } from '../api/create-employee';
import { useCreateEmployee } from './use-create-employee';

export function useCreateEmployeePage() {
  const router = useRouter();
  const { queryParams } = useQueryParams<{ companyId?: string }>();
  const companyId = queryParams.companyId;
  const { mutate: createEmployee, isPending } = useCreateEmployee(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateEmployeePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const listUrl = '/human-resource/manpower';

  const handleCancel = () => router.push(listUrl);

  const handleBeforeSubmit = (payload: CreateEmployeePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createEmployee(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push(listUrl);
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
