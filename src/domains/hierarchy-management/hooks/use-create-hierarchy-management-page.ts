'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { CreateHierarchyManagementPayload } from '../api/create-hierarchy-management';
import { useCreateHierarchyManagement } from './use-create-hierarchy-management';

export function useCreateHierarchyManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get('companyId');
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompanyStore();
  const effectiveCompanyId = queryCompanyId ?? selectedCompanyId;

  useEffect(() => {
    if (queryCompanyId && queryCompanyId !== selectedCompanyId) {
      setSelectedCompanyId(queryCompanyId);
    }

    if (!effectiveCompanyId) {
      router.push('/organization/hierarchy');
    }
  }, [effectiveCompanyId, queryCompanyId, selectedCompanyId, setSelectedCompanyId, router]);

  const { mutate: createHierarchyManagement, isPending } = useCreateHierarchyManagement(
    effectiveCompanyId ?? undefined
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateHierarchyManagementPayload | null>(
    null
  );
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const listUrl = effectiveCompanyId
    ? `/organization/hierarchy?companyId=${effectiveCompanyId}`
    : '/organization/hierarchy';

  const handleCancel = () => router.push(listUrl);

  const handleBeforeSubmit = (payload: CreateHierarchyManagementPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    createHierarchyManagement(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
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
