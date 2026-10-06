'use client';

import { useCallback, useState } from 'react';
import { getFieldErrors } from '@/lib/api-error';
import type { GetVendorOfferingDocumentsParams } from '../api/get-vendor-offering-documents';
import type { VendorOfferingDocument } from '../types';
import {
  useCreateVendorOfferingDocument,
  useDeleteVendorOfferingDocument,
  useUpdateVendorOfferingDocument,
  useVendorOfferingDocuments,
} from './use-vendor-offering-documents';

export interface UseVendorOfferingDocumentPageOptions {
  params?: GetVendorOfferingDocumentsParams;
}

export function useVendorOfferingDocumentPage(options?: UseVendorOfferingDocumentPageOptions) {
  const { data, isLoading, isError } = useVendorOfferingDocuments(options?.params);
  const { mutate: createVendorOfferingDocument, isPending: isCreating } =
    useCreateVendorOfferingDocument();
  const { mutate: updateVendorOfferingDocument, isPending: isUpdating } =
    useUpdateVendorOfferingDocument();
  const { mutate: deleteVendorOfferingDocument } = useDeleteVendorOfferingDocument();

  const [deleteTarget, setDeleteTarget] = useState<VendorOfferingDocument | null>(null);
  const [editTarget, setEditTarget] = useState<VendorOfferingDocument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const items = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleAdd = () => {
    setEditTarget(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: VendorOfferingDocument) => {
    setEditTarget(item);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (item: VendorOfferingDocument) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteVendorOfferingDocument(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  const handleStatusToggle = useCallback(
    (item: VendorOfferingDocument, isActive: boolean) => {
      updateVendorOfferingDocument(
        { id: item.id, payload: { isActive } },
        {
          onError: () => {
            // Revert is handled by query invalidation
          },
        }
      );
    },
    [updateVendorOfferingDocument]
  );

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditTarget(null);
    setServerErrors({});
  };

  const handleSave = useCallback(
    (payload: {
      vendorId: string;
      code: string;
      title: string;
      periodStart: string;
      periodEnd: string;
      description?: string;
      isActive: boolean;
      files: File[];
      existingIds: string[];
    }) => {
      const onError = (error: unknown) => {
        const raw = getFieldErrors(error);
        if (raw) {
          const normalized: Record<string, string[]> = {};
          Object.entries(raw).forEach(([key, messages]) => {
            const base = key.replace(/\.\d+$/, '');
            normalized[base] = normalized[base] ? [...normalized[base], ...messages] : messages;
          });
          setServerErrors(normalized);
        }
      };

      if (editTarget) {
        updateVendorOfferingDocument(
          { id: editTarget.id, payload },
          {
            onSuccess: () => {
              setIsDrawerOpen(false);
              setEditTarget(null);
              setServerErrors({});
            },
            onError,
          }
        );
      } else {
        createVendorOfferingDocument(payload, {
          onSuccess: () => {
            setIsDrawerOpen(false);
            setEditTarget(null);
            setServerErrors({});
          },
          onError,
        });
      }
    },
    [editTarget, createVendorOfferingDocument, updateVendorOfferingDocument]
  );

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    isSaving: isCreating || isUpdating,
    isUpdating,
    deleteTarget,
    setDeleteTarget,
    editTarget,
    isDrawerOpen,
    serverErrors,
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleStatusToggle,
    handleDrawerClose,
    handleSave,
  };
}
