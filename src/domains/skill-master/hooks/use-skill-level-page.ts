'use client';

import { useCallback } from 'react';
import type { GetSkillLevelsParams } from '../api/get-skill-levels';
import { useSkillLevels } from './use-skill-levels';

export interface UseSkillLevelPageOptions {
  params?: GetSkillLevelsParams;
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useSkillLevelPage(options?: UseSkillLevelPageOptions) {
  const { data: skillLevelsData, isLoading, isError } = useSkillLevels(options?.params);

  const skillLevels = skillLevelsData?.data || [];
  const totalItems = skillLevelsData?.meta?.total;
  const totalPages = skillLevelsData?.meta?.lastPage;

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
    skillLevels,
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
