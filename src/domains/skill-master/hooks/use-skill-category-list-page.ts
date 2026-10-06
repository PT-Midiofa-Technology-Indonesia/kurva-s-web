'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteSkillCategory } from '../api/delete-skill-category';
import type { GetSkillCategoriesParams } from '../api/get-skill-categories';
import { SKILL_CATEGORY_QUERY_KEYS, useSkillCategories } from './use-skill-categories';

export interface UseSkillCategoryListPageOptions {
  params?: GetSkillCategoriesParams;
  tab?: string;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useSkillCategoryListPage(options?: UseSkillCategoryListPageOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: skillCategoriesData, isLoading, isError } = useSkillCategories(options?.params);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);

  const { mutate: deleteSkillCategoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteSkillCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SKILL_CATEGORY_QUERY_KEYS.infinite() });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Skill Category') });
      setDeleteTarget(null);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });

  const skillCategories = skillCategoriesData?.data || [];
  const totalItems = skillCategoriesData?.meta?.total;
  const totalPages = skillCategoriesData?.meta?.lastPage;

  const handleAdd = useCallback(() => {
    const tabParam = options?.tab ? `?tab=${options.tab}` : '';
    router.push(`/master-data/skill-master/create${tabParam}`);
  }, [router, options?.tab]);

  const handleEdit = useCallback(
    (skillCategory: { id: string }) => {
      const tabParam = options?.tab ? `?tab=${options.tab}` : '';
      router.push(`/master-data/skill-master/${skillCategory.id}/edit${tabParam}`);
    },
    [router, options?.tab]
  );

  const handleDeleteClick = useCallback((skillCategory: { id: string; name: string }) => {
    setDeleteTarget(skillCategory);
  }, []);

  const handleDetail = useCallback((skillCategory: { id: string }) => {
    setDetailTarget(skillCategory.id);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteSkillCategoryMutation(deleteTarget.id);
  }, [deleteTarget, deleteSkillCategoryMutation]);

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      options?.onSetQueryParams?.({ search: value, page: 1 });
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
    skillCategories,
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
    handleIsActiveChange,
    handleSort,
    handlePaginationChange,
    detailTarget,
    setDetailTarget,
    handleDetail,
    handleDetailClose,
  };
}
