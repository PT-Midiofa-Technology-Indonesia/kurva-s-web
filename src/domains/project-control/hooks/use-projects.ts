import { useQuery } from '@tanstack/react-query';
import type { GetProjectsParams } from '../api/get-projects';
import { getProjects } from '../api/get-projects';

export function useProjects(params?: GetProjectsParams) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  });
}
