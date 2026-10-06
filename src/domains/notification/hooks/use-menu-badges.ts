'use client';

import { useQuery } from '@tanstack/react-query';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { getMenuBadges } from '../api/get-menu-badges';

const BASE_KEY = ['notifications'] as const;

export const NOTIFICATION_QUERY_KEYS = {
  all: BASE_KEY,
  menuBadges: (companyId?: string | null) =>
    [...BASE_KEY, 'menu-badges', companyId ?? null] as const,
  list: [...BASE_KEY, 'list'] as const,
};

export function useMenuBadges() {
  const companyId = useSelectedCompanyStore((s) => s.selectedCompanyId);

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.menuBadges(companyId),
    queryFn: () => getMenuBadges(companyId ?? undefined),
    // TODO: if real-time badges become a requirement, add
    // refetchInterval: 60_000 and refetchOnWindowFocus: true here.
  });
}
