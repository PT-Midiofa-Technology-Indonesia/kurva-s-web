import { useQuery } from '@tanstack/react-query';
import { getWorkspaces } from '../api/get-workspaces';

export const WORKSPACE_QUERY_KEYS = {
  list: () => ['auth', 'workspaces'] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.list(),
    queryFn: getWorkspaces,
  });
}
