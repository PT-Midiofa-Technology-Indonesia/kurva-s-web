import { useQuery } from '@tanstack/react-query';
import { type GetJobItemTypesParams, getJobItemTypes } from '../api/get-job-item-types';

export const JOB_ITEM_TYPE_QUERY_KEYS = {
  all: ['job-item-types'] as const,
  lists: () => [...JOB_ITEM_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...JOB_ITEM_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  infinite: () => [...JOB_ITEM_TYPE_QUERY_KEYS.all, 'infinite'] as const,
  details: () => [...JOB_ITEM_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOB_ITEM_TYPE_QUERY_KEYS.details(), id] as const,
};

export function useJobItemTypes(params?: GetJobItemTypesParams) {
  return useQuery({
    queryKey: [...JOB_ITEM_TYPE_QUERY_KEYS.all, params],
    queryFn: () => getJobItemTypes(params),
    placeholderData: (previousData) => previousData,
  });
}
