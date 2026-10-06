'use client';

import { useQuery } from '@tanstack/react-query';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import {
  getSubordinateEmployees,
  type SubordinateEmployeeCategory,
} from '../api/get-subordinate-employees';

export const SUBORDINATE_EMPLOYEES_QUERY_KEYS = {
  all: ['subordinate-employees'] as const,
};

export function useSubordinateEmployees(taskCategory?: SubordinateEmployeeCategory) {
  const projectId = useSelectedProjectStore((s) => s.selectedProjectId);

  return useQuery({
    queryKey: [...SUBORDINATE_EMPLOYEES_QUERY_KEYS.all, projectId, taskCategory],
    queryFn: () => getSubordinateEmployees(projectId, taskCategory),
  });
}
