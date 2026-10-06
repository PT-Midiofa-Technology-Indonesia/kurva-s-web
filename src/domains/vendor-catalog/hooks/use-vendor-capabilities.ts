'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createVendorCapability } from '../api/create-vendor-capability';
import { deleteVendorCapability } from '../api/delete-vendor-capability';
import type { GetVendorCapabilitiesParams } from '../api/get-vendor-capabilities';
import { getVendorCapabilities } from '../api/get-vendor-capabilities';
import { updateVendorCapability } from '../api/update-vendor-capability';

const QUERY_KEY = 'vendor-capabilities';

export function useVendorCapabilities(params?: GetVendorCapabilitiesParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVendorCapabilities(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateVendorCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorCapability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Capability') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useUpdateVendorCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateVendorCapability>[1];
    }) => updateVendorCapability(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Capability') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useDeleteVendorCapability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorCapability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Capability') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
