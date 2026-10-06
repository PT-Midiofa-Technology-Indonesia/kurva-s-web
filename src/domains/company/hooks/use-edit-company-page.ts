'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getFieldErrors } from '@/lib/api-error';

import type { UpdateCompanyPayload } from '../api/update-company';
import { COMPANY_QUERY_KEYS } from './use-companies';
import { useCompany } from './use-company';
import { useUpdateCompany } from './use-update-company';

export function useEditCompanyPage(companyId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: company, isLoading } = useCompany(companyId);
  const { mutate: updateCompany, isPending } = useUpdateCompany(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateCompanyPayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/organization/company');

  const handleBeforeSubmit = (payload: UpdateCompanyPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateCompany(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(companyId) });
        queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/organization/company');
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
    company,
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
