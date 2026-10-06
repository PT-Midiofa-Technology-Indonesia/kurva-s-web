'use client';

import { useCallback, useMemo } from 'react';
import type { BOQStage, GetBOQProjectsParams } from '../api/get-boq-projects';
import { parseBoqStatusFilter } from '../utils';
import { useBOQProjects } from './use-boq-projects';

const STAGE_FILTER_KEY: Record<BOQStage, string> = {
  planning: 'statusBoqPlanning',
  final: 'statusBoqFinal',
  execution: 'statusBoqExecution',
};

export interface UseBOQProjectListPageOptions {
  stage: BOQStage;
  companyId?: string;
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    statusBoqPlanning?: string;
    statusBoqFinal?: string;
    statusBoqExecution?: string;
  };
  onUpdateQueryParam?: (key: string, value: string | undefined) => void;
  onSetQueryParams?: (params: Record<string, string | number | undefined>) => void;
}

export function useBOQProjectListPage(options: UseBOQProjectListPageOptions) {
  const { stage, companyId, params, onUpdateQueryParam, onSetQueryParams } = options;

  const statusBoqValue =
    stage === 'planning'
      ? params.statusBoqPlanning
      : stage === 'final'
        ? params.statusBoqFinal
        : params.statusBoqExecution;

  const queryParams = useMemo<GetBOQProjectsParams>(
    () => ({
      boqStage: stage,
      companyId,
      page: params.page ?? 1,
      perPage: params.perPage ?? 10,
      search: params.search,
      ...(stage === 'planning'
        ? {
            statusBoqPlanning:
              statusBoqValue && statusBoqValue !== 'all'
                ? parseBoqStatusFilter(statusBoqValue)
                : undefined,
          }
        : {}),
      ...(stage === 'final'
        ? {
            statusBoqFinal:
              statusBoqValue && statusBoqValue !== 'all'
                ? parseBoqStatusFilter(statusBoqValue)
                : undefined,
          }
        : {}),
      ...(stage === 'execution'
        ? {
            statusBoqExecution:
              statusBoqValue && statusBoqValue !== 'all'
                ? parseBoqStatusFilter(statusBoqValue)
                : undefined,
          }
        : {}),
    }),
    [stage, companyId, params, statusBoqValue]
  );

  const { projects, isLoading, totalItems, totalPages } = useBOQProjects(queryParams, stage);

  const handleSearchChange = useCallback(
    (value: string) => {
      onSetQueryParams?.({ search: value || undefined, page: 1 });
    },
    [onSetQueryParams]
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      const key = STAGE_FILTER_KEY[stage];
      onUpdateQueryParam?.(key, value === 'all' ? undefined : value);
    },
    [onUpdateQueryParam, stage]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      onSetQueryParams?.({ page, perPage });
    },
    [onSetQueryParams]
  );

  return {
    projects,
    isLoading,
    totalItems,
    totalPages,
    handleSearchChange,
    handleFilterChange,
    handlePaginationChange,
  };
}
