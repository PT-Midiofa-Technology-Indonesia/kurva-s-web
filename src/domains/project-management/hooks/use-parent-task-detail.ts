'use client';

import { useQuery } from '@tanstack/react-query';
import { getParentTaskDetail } from '../api/get-parent-task-detail';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

/**
 * Non-final (parent) item detail of the "Lihat" dialog. `boqItemId` is null whenever the dialog is
 * closed, so the query stays disabled and the endpoint is only hit while the dialog is open.
 */
export function useParentTaskDetail(boqItemId: string | null) {
  return useQuery({
    queryKey: [...MANPOWER_PLAN_QUERY_KEYS.all, 'parent-detail', boqItemId] as const,
    queryFn: () => getParentTaskDetail(boqItemId ?? ''),
    enabled: boqItemId !== null,
  });
}
