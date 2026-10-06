'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetCompaniesParams } from '../api/get-companies';
import type { CompanyListItem } from '../types';
import { useCompanies } from './use-companies';
import { useDeleteCompany } from './use-delete-company';

export interface UseCompanyPageOptions {
  params?: GetCompaniesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useCompanyPage(options?: UseCompanyPageOptions) {
  const router = useRouter();
  const { data: companiesData, isLoading, isError } = useCompanies(options?.params);
  const { mutate: deleteCompany } = useDeleteCompany();
  const [deleteTarget, setDeleteTarget] = useState<CompanyListItem | null>(null);
  const companies = companiesData?.data || [];
  const totalItems = companiesData?.meta?.total;
  const totalPages = companiesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push('/organization/company/create');
  };

  const handleEdit = (company: CompanyListItem) => {
    router.push(`/organization/company/${company.id}/edit`);
  };

  const handleDetail = (company: CompanyListItem) => {
    router.push(`/organization/company/${company.id}/detail`);
  };

  const handleDeleteClick = (company: CompanyListItem) => {
    setDeleteTarget(company);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteCompany(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
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
    companies,
    totalItems,
    totalPages,
    isLoading,
    isError,
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
