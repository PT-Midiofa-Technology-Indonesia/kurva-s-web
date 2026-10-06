import { within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { KPIListPage } from '../KPIListPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../hooks', () => ({
  usePerformanceGrades: () => ({ data: { data: [] } }),
  usePerformancePage: () => ({
    data: {
      data: {
        summary: {
          totalEmployees: 1,
          averageScore: 21.06,
          gradeDistribution: [{ grade: 'B', count: 1, percentage: 100 }],
        },
        employees: [
          {
            id: '019f32b5-1db3-712a-ab2d-41885ca577bb',
            name: 'Mobile Staff',
            position: 'Staff Mobile',
            employeeGrade: 'Skill Junior',
            pillars: [
              { code: 'attendance', name: 'Kehadiran', score: 1.45, finalScore: 0.36 },
              { code: 'productivity', name: 'Produktifitas', score: 77.78, finalScore: 19.44 },
              { code: 'work_quality', name: 'Kualitas Kerja', score: 5, finalScore: 1.25 },
            ],
            totalScore: 21.06,
            grade: { id: 'grade-b', code: 'B', name: 'B' },
            period: '2026-07',
          },
        ],
      },
      meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
      links: { first: null, last: null, prev: null, next: null },
      period: '2026-07',
    },
    isLoading: false,
    error: null,
    params: { month: 7, year: 2026, page: 1, perPage: 10 },
    companyId: '019f32b5-1bde-72ba-9a54-138c6040793d',
    companyOptions: [],
    handleCompanyChange: vi.fn(),
    setQueryParams: vi.fn(),
  }),
}));

describe('KPIListPage', () => {
  it('maps final score from totalScore and grade from grade.name', async () => {
    render(<KPIListPage />);

    expect(await screen.findByText('Mobile Staff')).toBeInTheDocument();
    expect(screen.getByText('21%')).toBeInTheDocument();

    const row = screen.getByText('Mobile Staff').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLTableRowElement).getByText('B')).toBeInTheDocument();
  });
});
