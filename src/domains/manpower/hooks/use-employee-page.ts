'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetEmployeesParams } from '../api/get-employees';
import type { Employee } from '../types';
import { useDeleteEmployee } from './use-delete-employee';
import { useEmployees } from './use-employees';

export interface UseEmployeePageOptions {
  params?: GetEmployeesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useEmployeePage(options?: UseEmployeePageOptions) {
  const router = useRouter();
  const {
    data: employeesData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useEmployees(options?.params);
  const companyId = options?.params?.companyId;
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee(companyId);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const employees = employeesData?.data || [];
  const totalItems = employeesData?.meta?.total;
  const totalPages = employeesData?.meta?.lastPage;

  const handleAdd = () => {
    const url = companyId
      ? `/human-resource/manpower/create?companyId=${companyId}`
      : '/human-resource/manpower/create';
    router.push(url);
  };

  const handleEdit = (employee: Employee) => {
    const url = companyId
      ? `/human-resource/manpower/${employee.id}/edit?companyId=${companyId}`
      : `/human-resource/manpower/${employee.id}/edit`;
    router.push(url);
  };

  const handleDetail = (employee: Employee) => {
    const url = companyId
      ? `/human-resource/manpower/${employee.id}?companyId=${companyId}`
      : `/human-resource/manpower/${employee.id}`;
    router.push(url);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeleteTarget(employee);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteEmployee(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        refetch();
      },
    });
  }, [deleteTarget, deleteEmployee, refetch]);

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
    employees,
    totalItems,
    totalPages,
    isLoading,
    isFetching,
    isError,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDetail,
    deleteTarget,
    setDeleteTarget,
    handleDeleteClick,
    handleDeleteConfirm,
    handleIsActiveChange,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
  };
}
