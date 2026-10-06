'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { BOQProjectListItem } from '@/shared/components/templates/BOQ/types/boq-project-list.types';
import { type BOQStage, type GetBOQProjectsParams, getBOQProjects } from '../api/get-boq-projects';
import { mapBOQProjectToListItem } from '../services/boq-project-list.service';

export const BOQ_PROJECT_QUERY_KEYS = {
  all: ['boq-projects'] as const,
  list: (params: GetBOQProjectsParams) => [...BOQ_PROJECT_QUERY_KEYS.all, 'list', params] as const,
};

export function useBOQProjects(params: GetBOQProjectsParams, stage: BOQStage) {
  const { data, isLoading } = useQuery({
    queryKey: BOQ_PROJECT_QUERY_KEYS.list(params),
    queryFn: () => getBOQProjects(params),
    enabled: !!params.companyId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const projects = useMemo<BOQProjectListItem[]>(
    () => (data?.data ?? []).map((p) => mapBOQProjectToListItem(p, stage)),
    [data?.data, stage]
  );

  return {
    projects,
    isLoading,
    totalItems: data?.meta?.total,
    totalPages: data?.meta?.lastPage,
  };
}
