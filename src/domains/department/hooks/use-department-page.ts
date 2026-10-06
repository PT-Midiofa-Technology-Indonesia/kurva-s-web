'use client';

import { useCallback } from 'react';
import type { GetDepartmentsParams } from '../api/get-departments';
import { useDepartments } from './use-departments';

export interface UseDepartmentPageOptions {
  params?: GetDepartmentsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useDepartmentPage(options?: UseDepartmentPageOptions) {
  const { data: departmentsData, isLoading, isError } = useDepartments(options?.params);

  const departments = departmentsData?.data || [];
  const totalItems = departmentsData?.meta?.total;
  const totalPages = departmentsData?.meta?.lastPage;

  const handleIsActiveChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue === 'all' || !stringValue) {
        options?.onUpdateQueryParam?.('isActive', undefined);
      } else {
        options?.onUpdateQueryParam?.('isActive', stringValue);
      }
    },
    [options]
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      options?.onSetQueryParams?.({ sortBy, sortOrder });
    },
    [options]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      options?.onSetQueryParams?.({ page, perPage });
    },
    [options]
  );

  return {
    departments,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
