import { useQuery } from '@tanstack/react-query';
import { type GetApprovalGroupsParams, getApprovalGroups } from '../api/get-approval-groups';

export function useApprovalGroups(params?: GetApprovalGroupsParams) {
  return useQuery({
    queryKey: ['approval-groups', params],
    queryFn: () => getApprovalGroups(params),
    placeholderData: (previousData) => previousData,
  });
}
