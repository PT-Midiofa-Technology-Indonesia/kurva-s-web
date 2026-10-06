'use client';

import { useCallback, useState } from 'react';
import type { GetVendorCapabilitiesParams } from '../api/get-vendor-capabilities';
import type { VendorCapability } from '../types';
import {
  useCreateVendorCapability,
  useDeleteVendorCapability,
  useUpdateVendorCapability,
  useVendorCapabilities,
} from './use-vendor-capabilities';

export interface UseVendorCapabilityPageOptions {
  params?: GetVendorCapabilitiesParams;
}

export function useVendorCapabilityPage(options?: UseVendorCapabilityPageOptions) {
  const { data, isLoading, isError } = useVendorCapabilities(options?.params);
  const { mutate: createVendorCapability, isPending: isCreating } = useCreateVendorCapability();
  const { mutate: updateVendorCapability, isPending: isUpdating } = useUpdateVendorCapability();
  const { mutate: deleteVendorCapability } = useDeleteVendorCapability();

  const [deleteTarget, setDeleteTarget] = useState<VendorCapability | null>(null);
  const [editTarget, setEditTarget] = useState<VendorCapability | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleAdd = () => {
    setEditTarget(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: VendorCapability) => {
    setEditTarget(item);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (item: VendorCapability) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteVendorCapability(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  const handleStatusToggle = useCallback(
    (item: VendorCapability, isActive: boolean) => {
      updateVendorCapability(
        { id: item.id, payload: { isActive } },
        {
          onError: () => {
            // Revert is handled by query invalidation
          },
        }
      );
    },
    [updateVendorCapability]
  );

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditTarget(null);
  };

  const handleSave = useCallback(
    (payload: { vendorId: string; skillCatalogId: string; isActive: boolean }) => {
      if (editTarget) {
        updateVendorCapability(
          { id: editTarget.id, payload },
          {
            onSuccess: () => {
              setIsDrawerOpen(false);
              setEditTarget(null);
            },
          }
        );
      } else {
        createVendorCapability(payload, {
          onSuccess: () => {
            setIsDrawerOpen(false);
            setEditTarget(null);
          },
        });
      }
    },
    [editTarget, createVendorCapability, updateVendorCapability]
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
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleStatusToggle,
    handleDrawerClose,
    handleSave,
  };
}
