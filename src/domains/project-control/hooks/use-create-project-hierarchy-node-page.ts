'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getFieldErrors } from '@/shared/lib/api-error';
import type { CreateProjectHierarchyNodePayload } from '../types/project-hierarchy-node';
import { useCreateProjectHierarchyNode } from './use-project-hierarchy-nodes-mutations';

export function useCreateProjectHierarchyNodePage(props: { projectId: string }) {
  const { projectId } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetParentId = searchParams.get('parentId') || null;
  const presetParentName = searchParams.get('parentName') || undefined;

  const { mutateAsync: createNode, isPending } = useCreateProjectHierarchyNode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<CreateProjectHierarchyNodePayload | null>(
    null
  );
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleBack = useCallback(
    () => router.push(`/project-control/project/${projectId}/project-hierarchy`),
    [router, projectId]
  );

  const handleBeforeSubmit = useCallback((payload: CreateProjectHierarchyNodePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (!pendingPayload) return;
    createNode(pendingPayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push(`/project-control/project/${projectId}/project-hierarchy`);
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  }, [pendingPayload, createNode, router, projectId]);

  const handleDialogCancel = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  }, []);

  return {
    projectId,
    presetParentId,
    presetParentName,
    isDialogOpen,
    setIsDialogOpen,
    isPending,
    serverErrors,
    handleBack,
    handleBeforeSubmit,
    handleConfirmSubmit,
    handleDialogCancel,
  };
}
