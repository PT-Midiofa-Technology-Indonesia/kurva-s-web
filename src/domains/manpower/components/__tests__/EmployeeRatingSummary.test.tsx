import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { EmployeeRatingSummary } from '../EmployeeRatingSummary';

const summaryMock = {
  overallAvg: 4.15,
  totalRatings: 3,
  lastRatedAt: '2026-07-16T10:20:00+00:00',
  perCategory: [
    {
      categoryId: 'cat-1',
      categoryCode: 'capability',
      categoryName: 'Capability',
      avgScore: 4.33,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-2',
      categoryCode: 'responsibility',
      categoryName: 'Responsibility',
      avgScore: 4,
      count: 3,
      isActive: true,
    },
    {
      categoryId: 'cat-3',
      categoryCode: 'quality',
      categoryName: 'Quality',
      avgScore: 4.12,
      count: 3,
      isActive: true,
    },
  ],
};

vi.mock('@/domains/manpower/hooks/use-employee-rating-summary', () => ({
  useEmployeeRatingSummary: () => ({
    data: { success: true, message: 'Data berhasil diambil.', data: summaryMock },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe('EmployeeRatingSummary', () => {
  it('renders the summary section in a standalone layout', () => {
    render(<EmployeeRatingSummary employeeId="employee-1" />);

    expect(
      screen.getByRole('heading', {
        name: /Ringkasan Rating/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rata-rata rating karyawan berdasarkan seluruh project/i)
    ).toBeInTheDocument();
    expect(screen.getByText('4.15 / 5')).toBeInTheDocument();
    expect(
      screen.getByText('3 rating', { selector: 'p.text-sm.text-slate-500' })
    ).toBeInTheDocument();
    expect(screen.getByText('Capability')).toBeInTheDocument();
    expect(screen.getByText('Responsibility')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
  });
});
