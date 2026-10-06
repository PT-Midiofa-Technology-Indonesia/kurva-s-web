'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectOption } from '@/shared/components/atoms';
import { getUserProjects } from '../api/get-user-projects';

export function useMyProjects() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-projects', 'options'],
    queryFn: () => getUserProjects({ page: 1, perPage: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo<SelectOption[]>(() => {
    return (data?.data ?? []).map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [data]);

  return {
    options,
    isLoading,
    isError,
  };
}
