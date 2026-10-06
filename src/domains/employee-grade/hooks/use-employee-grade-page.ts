'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetEmployeeGradesParams } from '../api/get-employee-grades';
import type { EmployeeGrade } from '../types';
import { useDeleteEmployeeGrade } from './use-delete-employee-grade';
import { useEmployeeGrades } from './use-employee-grades';

export interface UseEmployeeGradePageOptions {
  params?: GetEmployeeGradesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useEmployeeGradePage(options?: UseEmployeeGradePageOptions) {
  const router = useRouter();
  const {
    data: employeeGradesData,
    isLoading,
    isError,
    refetch,
  } = useEmployeeGrades(options?.params);
  const { mutate: deleteEmployeeGrade } = useDeleteEmployeeGrade();
  const [deleteTarget, setDeleteTarget] = useState<EmployeeGrade | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const employeeGrades = employeeGradesData?.data || [];
  const totalItems = employeeGradesData?.meta?.total;
  const totalPages = employeeGradesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/master-data/employee-grade/create');
  };

  const handleEdit = (employeeGrade: EmployeeGrade) => {
    router.push(`/master-data/employee-grade/${employeeGrade.id}/edit`);
  };

  const handleDetail = (employeeGrade: EmployeeGrade) => {
    setDetailTarget(employeeGrade.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/employee-grade/${detailTarget}/edit`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (employeeGrade: EmployeeGrade) => {
    setDeleteTarget(employeeGrade);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteEmployeeGrade(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

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
    employeeGrades,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleEdit,
    handleDetail,
    detailTarget,
    handleDetailClose,
    handleDetailEdit,
    handleDetailSuccess,
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
