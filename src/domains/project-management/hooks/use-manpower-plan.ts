'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { getManpowerPlan, type ManpowerPlanList } from '../api/get-manpower-plan';

/** Single source of truth for every manpower plan query key — other hooks import from here. */
export const MANPOWER_PLAN_QUERY_KEYS = {
  all: ['manpower-plan'] as const,
  tree: () => [...MANPOWER_PLAN_QUERY_KEYS.all, 'tree'] as const,
  assignment: (boqItemId: string) =>
    [...MANPOWER_PLAN_QUERY_KEYS.all, 'assignment', boqItemId] as const,
} as const;

/**
 * Real `GET /project-management/manpower-planning` — full `{project, tree}` payload, unfiltered.
 * The search/status filters are applied in `useManpowerPlanPage`, NOT in the query key, so the
 * whole payload is fetched once and shared (e.g. with `useManpowerProject`).
 */
export function useManpowerPlan(): UseQueryResult<ManpowerPlanList> {
  return useQuery({
    queryKey: MANPOWER_PLAN_QUERY_KEYS.tree(),
    queryFn: () => getManpowerPlan(),
  });
}
