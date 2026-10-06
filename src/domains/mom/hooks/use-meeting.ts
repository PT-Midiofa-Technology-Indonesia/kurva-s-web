import { useQuery } from '@tanstack/react-query';
import { getMeeting } from '../api/get-meeting';
import { MOM_QUERY_KEYS } from './use-meetings';

export function useMeeting(id: string, companyId: string | undefined) {
  return useQuery({
    queryKey: MOM_QUERY_KEYS.detail(id),
    queryFn: () => getMeeting(id, companyId as string),
    enabled: Boolean(id) && Boolean(companyId),
  });
}
