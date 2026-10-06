'use client';

import { useCallback, useState } from 'react';
import type { GetVendorServiceCoveragesParams } from '../api/get-vendor-service-coverages';
import {
  useSyncVendorServiceCoverages,
  useVendorServiceCoverages,
} from './use-vendor-service-coverages';

export interface UseVendorServiceCoveragePageOptions {
  params?: GetVendorServiceCoveragesParams;
}

export function useVendorServiceCoveragePage(options?: UseVendorServiceCoveragePageOptions) {
  const { data, isLoading, isError } = useVendorServiceCoverages(options?.params);
  const { mutate: syncVendorServiceCoverages, isPending: isSaving } =
    useSyncVendorServiceCoverages();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const items = data?.data || [];

  const handleAdd = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleSave = useCallback(
    (payload: { vendorId: string; coverages: { provinceId: string; cityIds: string[] }[] }) => {
      syncVendorServiceCoverages(
        {
          vendorId: payload.vendorId,
          coverages: payload.coverages,
        },
        {
          onSuccess: () => {
            setIsDrawerOpen(false);
          },
        }
      );
    },
    [syncVendorServiceCoverages]
  );

  return {
    items,
    isLoading,
    isError,
    isSaving,
    isDrawerOpen,
    handleAdd,
    handleDrawerClose,
    handleSave,
  };
}
