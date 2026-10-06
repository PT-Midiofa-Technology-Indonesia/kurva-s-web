'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SelectGroup } from '@/shared/components/atoms';
import { getEmployeesByPosition } from '../api/get-employees-by-position';

export function useEmployeesByPosition(positionId: string | null, projectId?: string) {
  const enabled = !!positionId;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employees-by-position', positionId, projectId],
    queryFn: () => getEmployeesByPosition(positionId!, projectId),
    enabled,
  });

  const groupOptions: SelectGroup[] = useMemo(() => {
    if (!data) return [];

    const groups: SelectGroup[] = [];

    if (data.matchedEmployees.length > 0) {
      groups.push({
        heading: 'Skill Match',
        headingBadge: `${data.skillMatchCount} PIC`,
        options: data.matchedEmployees.map((emp) => ({
          value: emp.id,
          label: emp.fullName,
          skills: emp.skills,
        })),
      });
    }

    if (data.unmatchedEmployees.length > 0) {
      groups.push({
        heading: 'Skill Not Match',
        headingBadge: `${data.skillNotMatchCount} PIC`,
        options: data.unmatchedEmployees.map((emp) => ({
          value: emp.id,
          label: emp.fullName,
          skills: emp.skills,
        })),
      });
    }

    return groups;
  }, [data]);

  return {
    groupOptions,
    isLoading: isLoading && enabled,
    isError,
    error: error ? (error as Error) : null,
  };
}
