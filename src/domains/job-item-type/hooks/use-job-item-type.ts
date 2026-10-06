'use client';

import { useQuery } from '@tanstack/react-query';

import { getJobItemType } from '../api/get-job-item-type';
import { JOB_ITEM_TYPE_QUERY_KEYS } from './use-job-item-types';

export function useJobItemType(jobItemTypeId: string) {
  return useQuery({
    queryKey: JOB_ITEM_TYPE_QUERY_KEYS.detail(jobItemTypeId),
    queryFn: () => getJobItemType(jobItemTypeId),
    enabled: !!jobItemTypeId,
    select: (data) => (data ? data.data : null),
  });
}
