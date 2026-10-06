'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiErrorClass } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { UpdateLeaveParams } from '../api/update-leave';
import { updateLeave } from '../api/update-leave';
import type { LeaveListItem } from '../types';
import { getFriendlyLeaveErrorToastOptions } from '../utils/leave-error-message';
import { LEAVE_DETAIL_QUERY_KEYS } from './use-leave-detail';
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

function shouldUpdateLeaveList(filters: Record<string, unknown> | null, companyId: string) {
  if (!filters) return false;
  if (typeof filters.companyId === 'string' && filters.companyId !== companyId) return false;
  return true;
}

function patchUpdatedLeave(
  current: ApiPaginatedResponse<LeaveListItem[]> | undefined,
  updatedLeave: LeaveListItem
): ApiPaginatedResponse<LeaveListItem[]> | undefined {
  if (!current?.data) return current;

  const data = current.data.map((item) => (item.id === updatedLeave.id ? updatedLeave : item));

  return {
    ...current,
    data,
  };
}

export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateLeaveParams) => {
      const response = await updateLeave(params);

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
        const updatedLeave = response.data as LeaveListItem;

        queryClient
          .getQueryCache()
          .findAll({ queryKey: LEAVE_QUERY_KEYS.lists() })
          .forEach((query) => {
            const filters = parseLeaveListFilters(query.queryKey);
            if (!shouldUpdateLeaveList(filters, variables.companyId)) return;

            queryClient.setQueryData<ApiPaginatedResponse<LeaveListItem[]>>(
              query.queryKey,
              (current) => patchUpdatedLeave(current, updatedLeave)
            );
          });

        queryClient.setQueryData(
          LEAVE_DETAIL_QUERY_KEYS.detail(variables.id, variables.companyId),
          {
            success: true,
            message: 'OK',
            data: updatedLeave,
          }
        );
      }

      queryClient.invalidateQueries({ queryKey: LEAVE_TYPES_QUERY_KEYS.all });

      toast.success({ title: 'Cuti berhasil diperbarui' });
    },
    onError: (error) => {
      toast.error(getFriendlyLeaveErrorToastOptions(error));
    },
  });
}
