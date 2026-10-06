'use client';

import { useQuery } from '@tanstack/react-query';

import { getUser } from '../api/get-user';
import { USER_QUERY_KEYS } from './use-users';

export function useUser(userId: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => getUser(userId),
    enabled: !!userId,
    select: (data) => (data ? data.data : null),
  });
}
