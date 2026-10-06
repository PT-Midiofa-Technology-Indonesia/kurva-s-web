'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { UpdateDocumentTypePayload } from '../api/update-document-type';
import { useDocumentType } from './use-document-type';
import { DOCUMENT_TYPE_QUERY_KEYS } from './use-document-types';
import { useUpdateDocumentType } from './use-update-document-type';

export function useEditDocumentTypePage(documentTypeId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: documentType, isLoading } = useDocumentType(documentTypeId);
  const { mutate: updateDocumentType, isPending } = useUpdateDocumentType(documentTypeId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<UpdateDocumentTypePayload | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const handleCancel = () => router.push('/master-data/document?tab=document-type');

  const handleBeforeSubmit = (payload: UpdateDocumentTypePayload) => {
    setPendingPayload(payload);
    setServerErrors({});
    setIsDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingPayload) return;
    updateDocumentType(pendingPayload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.all });
        queryClient.invalidateQueries({
          queryKey: DOCUMENT_TYPE_QUERY_KEYS.detail(documentTypeId),
        });
        queryClient.invalidateQueries({ queryKey: DOCUMENT_TYPE_QUERY_KEYS.infinite() });
        setIsDialogOpen(false);
        setPendingPayload(null);
        router.push('/master-data/document?tab=document-type');
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
    documentType,
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
