import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as saveProjectManpowerRatingApi from '@/domains/project-control/api/save-project-manpower-rating';
import type { ProjectManpowerRatingPayload } from '@/domains/project-control/types/project-manpower-rating';
import { PROJECT_MANPOWER_QUERY_KEYS } from '../use-project-manpower';
import { useSaveProjectManpowerRating } from '../use-save-project-manpower-rating';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSaveProjectManpowerRating', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(saveProjectManpowerRatingApi, 'saveProjectManpowerRating').mockReset();
  });

  it('invalidates all project manpower list variants after saving a rating', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const payload: ProjectManpowerRatingPayload = {
      ratedAt: '2026-08-21',
      overallNote: null,
      categoryScores: [{ categoryId: 'category-1', score: 5, note: null }],
    };

    vi.spyOn(saveProjectManpowerRatingApi, 'saveProjectManpowerRating').mockResolvedValue({
      id: 'rating-1',
      ratedAt: '2026-08-21T00:00:00+00:00',
      overallScore: 5,
      note: null,
      ratedBy: null,
      source: { type: 'project', id: 'project-1', label: null, deleted: false },
      scores: [],
    });

    const { result } = renderHook(() => useSaveProjectManpowerRating('project-1', 'employee-1'), {
      wrapper,
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROJECT_MANPOWER_QUERY_KEYS.lists(),
    });
  });
});
