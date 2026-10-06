'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteSkillCatalog } from '../api/delete-skill-catalog';
import type { GetSkillCatalogsParams } from '../api/get-skill-catalogs';
import { SKILL_CATALOG_QUERY_KEYS, useSkillCatalogs } from './use-skill-catalogs';

export interface UseSkillCatalogListPageOptions {
  params?: GetSkillCatalogsParams;
  tab?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useSkillCatalogListPage(options?: UseSkillCatalogListPageOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: skillCatalogsData, isLoading, isError } = useSkillCatalogs(options?.params);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const { mutate: deleteSkillCatalogMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteSkillCatalog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SKILL_CATALOG_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Skill Catalog') });
      setDeleteTarget(null);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });

  const skillCatalogs = skillCatalogsData?.data || [];
  const totalItems = skillCatalogsData?.meta?.total;
  const totalPages = skillCatalogsData?.meta?.lastPage;

  const handleAdd = useCallback(() => {
    const tabParam = options?.tab ? `?tab=${options.tab}` : '';
    router.push(`/master-data/skill-master/create${tabParam}`);
  }, [router, options?.tab]);

  const handleEdit = useCallback(
    (skillCatalog: { id: string }) => {
      const tabParam = options?.tab ? `?tab=${options.tab}` : '';
      router.push(`/master-data/skill-master/${skillCatalog.id}/edit${tabParam}`);
    },
    [router, options?.tab]
  );

  const handleDeleteClick = useCallback((skillCatalog: { id: string; name: string }) => {
    setDeleteTarget(skillCatalog);
  }, []);

  const handleDetail = useCallback((skillCatalog: { id: string }) => {
    setDetailTarget(skillCatalog.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteSkillCatalogMutation(deleteTarget.id);
  }, [deleteTarget, deleteSkillCatalogMutation]);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
    },
    [options]
  );

  const handleSkillLevelChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      options?.onUpdateQueryParam?.('skillLevelId', stringValue || undefined);
    },
    [options]
  );

  const handleSkillCategoryChange = useCallback(
    (value: string | string[] | null | undefined) => {
      const stringValue = Array.isArray(value) ? value[0] : value;
      options?.onUpdateQueryParam?.('skillCategoryId', stringValue || undefined);
    },
    [options]
  );

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
    skillCatalogs,
    totalItems,
    totalPages,
    isLoading,
    isError,
    isDeleting,
    handleAdd,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    deleteTarget,
    setDeleteTarget,
    handleSearchChange,
    handleSkillLevelChange,
    handleSkillCategoryChange,
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
    detailTarget,
    setDetailTarget,
    handleDetail,
    handleDetailClose,
  };
}
