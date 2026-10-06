'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getNotifications } from '../api/get-notifications';
import { NOTIFICATION_QUERY_KEYS } from './use-menu-badges';

const NOTIFICATIONS_PER_PAGE = 20;

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list,
    queryFn: ({ pageParam }) =>
      getNotifications({ filter: 'all', page: pageParam, perPage: NOTIFICATIONS_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.lastPage
        ? lastPage.meta.currentPage + 1
        : undefined,
    staleTime: 30_000,
  });
}
