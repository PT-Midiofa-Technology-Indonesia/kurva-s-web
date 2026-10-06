import { useQuery } from '@tanstack/react-query';
import { type GetMeetingsParams, getMeetings } from '../api/get-meetings';

export const MOM_QUERY_KEYS = {
  all: ['meetings'] as const,
  lists: () => [...MOM_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetMeetingsParams) => [...MOM_QUERY_KEYS.lists(), params] as const,
  details: () => [...MOM_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MOM_QUERY_KEYS.details(), id] as const,
};

export function useMeetings(params: GetMeetingsParams) {
  return useQuery({
    queryKey: MOM_QUERY_KEYS.list(params),
    queryFn: () => getMeetings(params),
    enabled: Boolean(params.companyId),
  });
}
