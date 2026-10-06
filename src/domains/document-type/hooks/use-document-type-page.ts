'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { GetDocumentTypesParams } from '../api/get-document-types';
import type { DocumentType } from '../types';
import { useDeleteDocumentType } from './use-delete-document-type';
import { useDocumentTypes } from './use-document-types';

export interface UseDocumentTypePageOptions {
  params?: GetDocumentTypesParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useDocumentTypePage(options?: UseDocumentTypePageOptions) {
  const router = useRouter();
  const {
    data: documentTypesData,
    isLoading,
    isError,
    refetch,
  } = useDocumentTypes(options?.params);
  const { mutate: deleteDocumentType } = useDeleteDocumentType();
  const [deleteTarget, setDeleteTarget] = useState<DocumentType | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const documentTypes = documentTypesData?.data || [];
  const totalItems = documentTypesData?.meta?.total;
  const totalPages = documentTypesData?.meta?.lastPage;

  const handleAdd = () => {
    router.push(`/master-data/document/create?tab=document-type`);
  };

  const handleEdit = (documentType: DocumentType) => {
    router.push(`/master-data/document/${documentType.id}/edit?tab=document-type`);
  };

  const handleDetail = (documentType: DocumentType) => {
    setDetailTarget(documentType.id);
  };

  const handleDetailClose = () => {
    setDetailTarget(null);
  };

  const handleDetailEdit = () => {
    if (detailTarget) {
      setDetailTarget(null);
      router.push(`/master-data/document/${detailTarget}/edit?tab=document-type`);
    }
  };

  const handleDetailSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (documentType: DocumentType) => {
    setDeleteTarget(documentType);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteDocumentType(deleteTarget.id, {
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
    documentTypes,
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
