'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getFieldErrors } from '@/shared/lib/api-error';
import type { CreateProjectHierarchyTemplateNodePayload } from '../types';
import { useCreateProjectHierarchyTemplateNode } from './use-project-hierarchy-template-nodes';

export function useCreateProjectHierarchyTemplateNodePage(props: { templateId: string }) {
  const { templateId } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const presetParentId = searchParams.get('parentId') || null;
  const presetParentName = searchParams.get('parentName') || undefined;

  const { mutateAsync: createNode, isPending } = useCreateProjectHierarchyTemplateNode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<CreateProjectHierarchyTemplateNodePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleBack = useCallback(
    () => router.push(`/project-control/project/${templateId}/detail`),
    [router, templateId]
  );

  const handleBeforeSubmit = useCallback((payload: CreateProjectHierarchyTemplateNodePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    if (!pendingPayload) return;
    createNode(pendingPayload as CreateProjectHierarchyTemplateNodePayload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setPendingPayload(null);
        setServerErrors({});
        router.push(`/project-control/project/${templateId}/detail`);
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setServerErrors(fieldErrors);
        }
      },
    });
  }, [pendingPayload, createNode, router, templateId]);

  const handleDialogCancel = useCallback(() => {
    setIsDialogOpen(false);
    setPendingPayload(null);
  }, []);

  return {
    templateId,
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
