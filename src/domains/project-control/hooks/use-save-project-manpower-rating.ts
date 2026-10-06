'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveProjectManpowerRating } from '../api/save-project-manpower-rating';
import type { ProjectManpowerRatingPayload } from '../types/project-manpower-rating';
import { PROJECT_MANPOWER_QUERY_KEYS } from './use-project-manpower';
import { PROJECT_MANPOWER_RATING_QUERY_KEYS } from './use-project-manpower-rating';

export function useSaveProjectManpowerRating(projectId: string, employeeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectManpowerRatingPayload) =>
      saveProjectManpowerRating({ projectId, employeeId: employeeId ?? '', payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: PROJECT_MANPOWER_QUERY_KEYS.lists(),
        }),
        ...(employeeId
          ? [
              queryClient.invalidateQueries({
                queryKey: PROJECT_MANPOWER_RATING_QUERY_KEYS.detail(projectId, employeeId),
              }),
            ]
          : []),
      ]);
    },
  });
}
