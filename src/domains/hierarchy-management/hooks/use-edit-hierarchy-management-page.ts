'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { UpdateHierarchyManagementPayload } from '../api/update-hierarchy-management';
import { useHierarchyManagement } from './use-hierarchy-management';
import { HIERARCHY_MANAGEMENT_QUERY_KEYS } from './use-hierarchy-managements';
import { useUpdateHierarchyManagement } from './use-update-hierarchy-management';

export function useEditHierarchyManagementPage(hierarchyManagementId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedCompanyId = useSelectedCompanyStore((s) => s.selectedCompanyId);
  const { data: hierarchyManagement, isLoading } = useHierarchyManagement(hierarchyManagementId);

  const effectiveCompanyId = selectedCompanyId ?? hierarchyManagement?.company?.id ?? undefined;

  useEffect(() => {
    if (!selectedCompanyId && hierarchyManagement && !hierarchyManagement.company?.id) {
      router.push('/organization/hierarchy');
    }
  }, [selectedCompanyId, hierarchyManagement, router]);

  const { mutate: updateHierarchyManagement, isPending } = useUpdateHierarchyManagement(
    hierarchyManagementId,
    effectiveCompanyId
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateHierarchyManagementPayload | null>(
    null
  );
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const listUrl = effectiveCompanyId
    ? `/organization/hierarchy?companyId=${effectiveCompanyId}`
    : '/organization/hierarchy';

  const handleCancel = () => router.push(listUrl);

  const handleBeforeSubmit = (payload: UpdateHierarchyManagementPayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateHierarchyManagement(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.detail(hierarchyManagementId),
        });
        queryClient.invalidateQueries({ queryKey: HIERARCHY_MANAGEMENT_QUERY_KEYS.infinite() });
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
    hierarchyManagement,
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
