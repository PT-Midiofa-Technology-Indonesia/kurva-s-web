'use client';

import { useCallback, useState } from 'react';
import type { GetVendorFleetVehiclesParams } from '../api/get-vendor-fleet-vehicles';
import type { VendorFleetVehicle } from '../types';
import {
  useCreateVendorFleetVehicle,
  useDeleteVendorFleetVehicle,
  useUpdateVendorFleetVehicle,
  useVendorFleetVehicles,
} from './use-vendor-fleet-vehicles';

export interface UseVendorFleetVehiclePageOptions {
  params?: GetVendorFleetVehiclesParams;
}

export function useVendorFleetVehiclePage(options?: UseVendorFleetVehiclePageOptions) {
  const { data, isLoading, isError } = useVendorFleetVehicles(options?.params);
  const { mutate: createVendorFleetVehicle, isPending: isCreating } = useCreateVendorFleetVehicle();
  const { mutate: updateVendorFleetVehicle, isPending: isUpdating } = useUpdateVendorFleetVehicle();
  const { mutate: deleteVendorFleetVehicle } = useDeleteVendorFleetVehicle();

  const [deleteTarget, setDeleteTarget] = useState<VendorFleetVehicle | null>(null);
  const [editTarget, setEditTarget] = useState<VendorFleetVehicle | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = data?.data || [];
  const totalItems = data?.meta?.total;
  const totalPages = data?.meta?.lastPage;

  const handleAdd = () => {
    setEditTarget(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: VendorFleetVehicle) => {
    setEditTarget(item);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (item: VendorFleetVehicle) => {
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteVendorFleetVehicle(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  const handleStatusToggle = useCallback(
    (item: VendorFleetVehicle, isActive: boolean) => {
      updateVendorFleetVehicle(
        { id: item.id, payload: { isActive } },
        {
          onError: () => {
            // Revert is handled by query invalidation
          },
        }
      );
    },
    [updateVendorFleetVehicle]
  );

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditTarget(null);
  };

  const handleSave = useCallback(
    (payload: {
      vendorId: string;
      name: string;
      code: string;
      vehicleType: string;
      plateNumber: string;
      brand?: string;
      model?: string;
      yearOfManufacture?: number;
      weightMax?: number;
      weightUomId?: string;
      volumeMax?: number;
      volumeUomId?: string;
      pricePerTripMin?: number;
      pricePerDistanceMin?: number;
      pricePerDistanceMax?: number;
      distanceValueMin?: number;
      distanceValueMax?: number;
      distanceUomId?: string;
      notes?: string;
      isActive: boolean;
    }) => {
      if (editTarget) {
        updateVendorFleetVehicle(
          { id: editTarget.id, payload },
          {
            onSuccess: () => {
              setIsDrawerOpen(false);
              setEditTarget(null);
            },
          }
        );
      } else {
        createVendorFleetVehicle(payload, {
          onSuccess: () => {
            setIsDrawerOpen(false);
            setEditTarget(null);
          },
        });
      }
    },
    [editTarget, createVendorFleetVehicle, updateVendorFleetVehicle]
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
