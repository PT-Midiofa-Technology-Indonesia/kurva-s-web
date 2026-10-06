'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { createVendorFleetVehicle } from '../api/create-vendor-fleet-vehicle';
import { deleteVendorFleetVehicle } from '../api/delete-vendor-fleet-vehicle';
import type { GetVendorFleetVehiclesParams } from '../api/get-vendor-fleet-vehicles';
import { getVendorFleetVehicles } from '../api/get-vendor-fleet-vehicles';
import { updateVendorFleetVehicle } from '../api/update-vendor-fleet-vehicle';

const QUERY_KEY = 'vendor-fleet-vehicles';
const DETAIL_QUERY_KEY = 'vendor-fleet-vehicle';

export function useVendorFleetVehicles(params?: GetVendorFleetVehiclesParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVendorFleetVehicles(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateVendorFleetVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorFleetVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.CREATED('Fleet Vehicle') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useUpdateVendorFleetVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateVendorFleetVehicle>[1];
    }) => updateVendorFleetVehicle(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DETAIL_QUERY_KEY, variables.id] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Fleet Vehicle') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}

export function useDeleteVendorFleetVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorFleetVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Fleet Vehicle') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
