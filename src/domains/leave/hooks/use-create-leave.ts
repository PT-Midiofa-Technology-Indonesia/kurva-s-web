'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiErrorClass } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { CreateLeaveParams } from '../api/create-leave';
import { createLeave } from '../api/create-leave';
import type { LeaveListItem } from '../types';
import { getFriendlyLeaveErrorToastOptions } from '../utils/leave-error-message';
import { LEAVE_TYPES_QUERY_KEYS } from './use-leave-types';
import { LEAVE_QUERY_KEYS } from './use-leaves';

function parseLeaveListFilters(queryKey: readonly unknown[]) {
  const filtersEntry = queryKey[2];
  if (!filtersEntry || typeof filtersEntry !== 'object' || !('filters' in filtersEntry)) {
    return null;
  }

  const filtersValue = (filtersEntry as { filters?: string }).filters;
  if (!filtersValue) return null;

  try {
    return JSON.parse(filtersValue) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function shouldOptimisticallyInsertLeave(
  filters: Record<string, unknown> | null,
  companyId: string
) {
  if (!filters) return false;
  if (typeof filters.companyId === 'string' && filters.companyId !== companyId) return false;
  if (filters.page && Number(filters.page) !== 1) return false;
  if (
    filters.search ||
    filters.status ||
    filters.leaveTypeIds ||
    filters.startDate ||
    filters.endDate ||
    filters.sortBy
  ) {
    return false;
  }

  return true;
}

function prependCreatedLeave(
  current: ApiPaginatedResponse<LeaveListItem[]> | undefined,
  nextLeave: LeaveListItem
): ApiPaginatedResponse<LeaveListItem[]> | undefined {
  if (!current?.data) return current;
  if (current.data.some((item) => item.id === nextLeave.id)) return current;

  const perPage = current.meta.perPage;
  const data = [nextLeave, ...current.data].slice(0, perPage);
  const total = current.meta.total + 1;

  return {
    ...current,
    data,
    meta: {
      ...current.meta,
      total,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      from: total > 0 ? 1 : null,
      to: total > 0 ? Math.min(total, perPage) : null,
    },
  };
}

export function useCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateLeaveParams) => {
      const response = await createLeave(params);

      if (!response.success) {
        throw new ApiErrorClass(
          response.message,
          undefined,
          response.errorCode ?? 'UNKNOWN',
          response.errors ?? undefined
        );
      }

      return response;
    },
    onSuccess: (response, variables) => {
      if (response.data) {
        const optimisticLeave = response.data as LeaveListItem;

        queryClient
          .getQueryCache()
          .findAll({ queryKey: LEAVE_QUERY_KEYS.lists() })
          .forEach((query) => {
            const filters = parseLeaveListFilters(query.queryKey);
            if (!shouldOptimisticallyInsertLeave(filters, variables.companyId)) return;

            queryClient.setQueryData<ApiPaginatedResponse<LeaveListItem[]>>(
              query.queryKey,
              (current) => prependCreatedLeave(current, optimisticLeave)
            );
          });
      }

      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEYS.all });

      toast.success({ title: 'Cuti berhasil diajukan' });
    },
    onError: (error) => {
      toast.error(getFriendlyLeaveErrorToastOptions(error));
    },
  });
}
