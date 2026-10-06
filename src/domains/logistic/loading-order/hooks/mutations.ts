'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/lib/toast';
import {
  cancelLoadingOrder,
  createLoadingOrder,
  deleteLoadingOrder,
  loadLoadingOrder,
  prepareLoadingOrder,
  updateLoadingOrder,
} from '../api';
import type { CreateLoadingOrderPayload, UpdateLoadingOrderPayload } from '../types';
import { LOADING_ORDER_QUERY_KEYS } from './queries';

export function useCreateLoadingOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      companyId,
    }: {
      payload: CreateLoadingOrderPayload;
      companyId?: string | null;
    }) => createLoadingOrder(payload, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Loading order berhasil dibuat' });
    },
  });
}

export function useUpdateLoadingOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
      companyId,
    }: {
      id: string;
      payload: UpdateLoadingOrderPayload;
      companyId?: string | null;
    }) => updateLoadingOrder(id, payload, companyId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: LOADING_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Loading order berhasil diperbarui' });
    },
  });
}

export function useDeleteLoadingOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId?: string | null }) =>
      deleteLoadingOrder(id, companyId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: LOADING_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: 'Loading order berhasil dihapus' });
    },
  });
}

function useLoadingOrderStatusAction(
  action: 'prepare' | 'load' | 'cancel',
  successMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId?: string | null }) => {
      if (action === 'prepare') return prepareLoadingOrder(id, companyId);
      if (action === 'load') return loadLoadingOrder(id, companyId);
      return cancelLoadingOrder(id, companyId);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: LOADING_ORDER_QUERY_KEYS.detail(variables.id, variables.companyId),
      });
      queryClient.invalidateQueries({ queryKey: LOADING_ORDER_QUERY_KEYS.pickers() });
      toast.success({ title: successMessage });
    },
  });
}

export const usePrepareLoadingOrder = () =>
  useLoadingOrderStatusAction('prepare', 'Loading order berhasil di-prepare');

export const useLoadLoadingOrder = () =>
  useLoadingOrderStatusAction('load', 'Loading order berhasil di-load');

export const useCancelLoadingOrder = () =>
  useLoadingOrderStatusAction('cancel', 'Loading order berhasil dibatalkan');
