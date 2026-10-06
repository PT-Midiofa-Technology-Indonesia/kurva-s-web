'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  cancelPickupOrder,
  changePickupOrderEmployee,
  completePickupOrder,
  createPickupOrder,
} from '../api';
import type {
  CancelPickupOrderPayload,
  ChangePickupOrderEmployeePayload,
  CompletePickupOrderPayload,
  CreatePickupOrderPayload,
} from '../types';
import { PICKUP_ORDER_QUERY_KEYS } from './queries';

export function useCreatePickupOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      companyId,
    }: {
      payload: CreatePickupOrderPayload;
      companyId?: string | null;
    }) => createPickupOrder(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Pickup order berhasil dibuat' });
    },
  });
}

export function useCompletePickupOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
      companyId,
    }: {
      id: string;
      payload: CompletePickupOrderPayload;
      companyId?: string | null;
    }) => completePickupOrder(id, payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PICKUP_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Pickup order berhasil diselesaikan' });
    },
  });
}

export function useCancelPickupOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
      companyId,
    }: {
      id: string;
      payload: CancelPickupOrderPayload;
      companyId?: string | null;
    }) => cancelPickupOrder(id, payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PICKUP_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Pickup order berhasil dibatalkan' });
    },
  });
}

export function useChangePickupOrderEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
      companyId,
    }: {
      id: string;
      payload: ChangePickupOrderEmployeePayload;
      companyId?: string | null;
    }) => changePickupOrderEmployee(id, payload, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PICKUP_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: PICKUP_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'PIC pickup order berhasil diperbarui' });
    },
  });
}
