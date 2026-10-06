import { describe, expect, it } from 'vitest';
import type { ProjectManpowerRatingCategory } from '../../types/project-manpower-rating';
import {
  getProjectManpowerRatingCategories,
  getProjectManpowerRatingFallback,
  getProjectManpowerRatingScore,
  shouldRefreshProjectManpowerRatingForm,
  shouldShowProjectManpowerRatingLoading,
  shouldUseSelectedProjectManpowerRating,
} from '../ProjectManpowerRatingModal';

const categories: ProjectManpowerRatingCategory[] = [
  {
    id: 'category-1',
    code: 'capability',
    name: 'Capability',
    description: null,
    sortOrder: 1,
    isActive: true,
  },
];

describe('getProjectManpowerRatingFallback', () => {
  it('keeps the selected employee rating available while detail is loading', () => {
    const fallback = getProjectManpowerRatingFallback(
      {
        employee: { id: 'employee-1', code: 'EMP-001', name: 'Denny Caknan' },
        hierarchy: {
          assignmentId: 'assignment-1',
          nodeId: 'node-1',
          assignedAt: null,
          position: null,
          parentPosition: null,
        },
        rating: {
          id: 'rating-1',
          ratedAt: '2026-08-26T00:00:00.000Z',
          overallScore: 4,
          note: null,
          ratedBy: null,
          source: { type: 'project', id: 'project-1', label: null, deleted: false },
          scores: [
            {
              categoryId: 'category-1',
              categoryCode: 'capability',
              categoryName: 'Capability',
              categoryStatus: 'active',
              score: 4,
              note: null,
            },
          ],
        },
      },
      categories
    );

    expect(fallback?.employee?.id).toBe('employee-1');
    expect(fallback?.activeCategories).toEqual(categories);
    expect(fallback?.rating?.scores[0]?.score).toBe(4);
  });

  it('does not create a fallback when the selected manpower has no employee', () => {
    expect(
      getProjectManpowerRatingFallback(
        {
          employee: null,
          hierarchy: {
            assignmentId: 'assignment-1',
            nodeId: 'node-1',
            assignedAt: null,
            position: null,
            parentPosition: null,
          },
          rating: null,
        },
        categories
      )
    ).toBeNull();
  });
});

describe('getProjectManpowerRatingScore', () => {
  it('matches an existing score by category code when the API omits categoryId', () => {
    expect(
      getProjectManpowerRatingScore(
        [
          {
            categoryId: null,
            categoryCode: 'capability',
            categoryName: 'Capability',
            categoryStatus: 'active',
            score: 4,
            note: null,
          },
        ],
        categories[0]
      )
    ).toEqual({ score: 4, note: null });
  });
});

describe('getProjectManpowerRatingCategories', () => {
  it('uses active categories from the categories query when detail has none yet', () => {
    expect(
      getProjectManpowerRatingCategories(
        {
          employee: null,
          activeCategories: [],
          rating: null,
        },
        categories
      )
    ).toEqual(categories);
  });
});

describe('shouldShowProjectManpowerRatingLoading', () => {
  it('shows loading while a selected employee has no matching detail yet', () => {
    expect(shouldShowProjectManpowerRatingLoading('employee-1', null, false)).toBe(true);
  });

  it('does not show loading after detail data is available or the request failed', () => {
    expect(shouldShowProjectManpowerRatingLoading('employee-1', {} as never, false)).toBe(false);
    expect(shouldShowProjectManpowerRatingLoading('employee-1', null, true)).toBe(false);
    expect(shouldShowProjectManpowerRatingLoading(null, null, false)).toBe(false);
  });
});

describe('shouldRefreshProjectManpowerRatingForm', () => {
  it('refreshes the form when the fetched detail belongs to the selected employee', () => {
    expect(shouldRefreshProjectManpowerRatingForm('employee-1', 'employee-1', 123)).toBe(true);
  });

  it('does not refresh for another employee or before a response is received', () => {
    expect(shouldRefreshProjectManpowerRatingForm('employee-1', 'employee-2', 123)).toBe(false);
    expect(shouldRefreshProjectManpowerRatingForm('employee-1', 'employee-1', 0)).toBe(false);
  });
});

describe('shouldUseSelectedProjectManpowerRating', () => {
  it('does not use an envelope before a create-session employee is selected', () => {
    expect(shouldUseSelectedProjectManpowerRating(null, false)).toBe(false);
  });

  it('uses the envelope after edit initialization or explicit employee selection', () => {
    expect(shouldUseSelectedProjectManpowerRating('employee-1', true)).toBe(true);
  });
});
