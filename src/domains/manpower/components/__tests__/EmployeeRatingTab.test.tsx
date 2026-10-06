import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { EmployeeRatingTab } from '../EmployeeRatingTab';

const historyMock = {
  data: [
    {
      id: 'rating-1',
      ratedAt: '2026-07-16T00:00:00+00:00',
      overallScore: 4.33,
      note: null,
      ratedBy: { id: 'user-1', name: 'Mobile Admin' },
      source: {
        type: 'project',
        id: 'project-1',
        label: 'PRJ-001',
        deleted: false,
      },
      scores: [
        {
          categoryId: 'cat-1',
          categoryCode: 'capability',
          categoryName: 'Capability',
          categoryStatus: 'active',
          score: 5,
          note: null,
        },
        {
          categoryId: 'cat-2',
          categoryCode: 'responsibility',
          categoryName: 'Responsibility',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'cat-3',
          categoryCode: 'quality',
          categoryName: 'Quality',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'cat-4',
          categoryCode: 'timeliness',
          categoryName: 'Timeliness',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'cat-5',
          categoryCode: 'communication',
          categoryName: 'Communication',
          categoryStatus: 'active',
          score: 5,
          note: null,
        },
      ],
    },
    {
      id: 'rating-2',
      ratedAt: '2026-07-15T00:00:00+00:00',
      overallScore: 3.75,
      note: 'Perlu follow-up',
      ratedBy: { id: 'user-2', name: 'Field Admin' },
      source: {
        type: 'project',
        id: 'project-2',
        label: 'PRJ-002',
        deleted: false,
      },
      scores: [
        {
          categoryId: 'cat-1',
          categoryCode: 'capability',
          categoryName: 'Capability',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
        {
          categoryId: 'cat-2',
          categoryCode: 'responsibility',
          categoryName: 'Responsibility',
          categoryStatus: 'active',
          score: 4,
          note: null,
        },
      ],
    },
  ],
  meta: { currentPage: 1, perPage: 20, total: 2, lastPage: 1, from: 1, to: 2 },
  links: { first: '', last: '', prev: null, next: null },
};

vi.mock('@/domains/manpower/hooks/use-employee-ratings', () => ({
  useEmployeeRatings: () => ({
    data: { success: true, message: 'Data berhasil diambil.', ...historyMock },
    isLoading: false,
    isError: false,
  }),
}));

describe('EmployeeRatingTab', () => {
  it('renders the rating history table without summary controls and supports search', () => {
    render(<EmployeeRatingTab employeeId="employee-1" />);

    expect(
      screen.getByRole('heading', {
        name: /Riwayat Rating/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cari project/i)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Info Project/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Capability/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PRJ-001' })).toHaveAttribute(
      'href',
      '/project-control/project/project-1/boq'
    );

    const row = screen.getByRole('row', { name: /PRJ-001/i });
    expect(row).toHaveTextContent('Mobile Admin');
    expect(row).toHaveTextContent('4 / 5');
    expect(screen.getByText('Showing 1 to 2 of 2 entries')).toBeInTheDocument();

    expect(
      screen.queryByRole('switch', { name: /Tampilkan semua kategori/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pilih tanggal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reset filter/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/Cari project/i), {
      target: { value: 'Mobile Admin' },
    });

    expect(screen.getByRole('link', { name: 'PRJ-001' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'PRJ-002' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 1 of 1 entries')).toBeInTheDocument();
  });
});
