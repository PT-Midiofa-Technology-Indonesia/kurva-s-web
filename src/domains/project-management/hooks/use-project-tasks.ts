export const PROJECT_TASK_QUERY_KEYS = {
  all: ['project-tasks'] as const,
  lists: () => [...PROJECT_TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROJECT_TASK_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PROJECT_TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROJECT_TASK_QUERY_KEYS.details(), id] as const,
};
