'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteVendorServiceCoverage } from '../api/delete-vendor-service-coverage';
import type { GetVendorServiceCoveragesParams } from '../api/get-vendor-service-coverages';
import { getVendorServiceCoverages } from '../api/get-vendor-service-coverages';
import { syncVendorServiceCoverages } from '../api/sync-vendor-service-coverages';

export const VENDOR_SERVICE_COVERAGE_QUERY_KEYS = {
  all: ['vendor-service-coverages'] as const,
};

export function useVendorServiceCoverages(params?: GetVendorServiceCoveragesParams) {
  return useQuery({
    queryKey: [...VENDOR_SERVICE_COVERAGE_QUERY_KEYS.all, params],
    queryFn: () => getVendorServiceCoverages(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useSyncVendorServiceCoverages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncVendorServiceCoverages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_SERVICE_COVERAGE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Service Coverage') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useDeleteVendorServiceCoverage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, provinceId }: { vendorId: string; provinceId: string }) =>
      deleteVendorServiceCoverage(vendorId, provinceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_SERVICE_COVERAGE_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Service Coverage') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
