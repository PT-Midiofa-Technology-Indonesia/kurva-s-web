'use client';

import { useQuery } from '@tanstack/react-query';
import { getManpowerAssignment } from '../api/get-manpower-assignment';
import { MANPOWER_PLAN_QUERY_KEYS } from './use-manpower-plan';

export function useManpowerAssignment(boqItemId: string | null) {
  return useQuery({
    queryKey: MANPOWER_PLAN_QUERY_KEYS.assignment(boqItemId ?? ''),
    queryFn: () => getManpowerAssignment(boqItemId ?? ''),
    enabled: !!boqItemId,
  });
}
