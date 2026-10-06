'use client';

import { useQuery } from '@tanstack/react-query';
import { getManpowerPlan } from '../api/get-manpower-plan';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

/**
 * InformasiProjectCard slice of the manpower planning list — shares the `tree` query key so the
 * project stub and the tree are fetched once and cached together.
 */
export function useManpowerProject() {
  return useQuery({
    queryKey: MANPOWER_PLAN_QUERY_KEYS.tree(),
    queryFn: () => getManpowerPlan(),
    select: (data) => data.project,
  });
}
