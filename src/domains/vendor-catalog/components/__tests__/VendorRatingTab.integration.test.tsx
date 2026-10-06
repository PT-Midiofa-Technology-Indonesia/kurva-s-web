import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { useVendorRatingSummary } from '../../hooks/use-vendor-rating-summary';
import { useVendorRatings } from '../../hooks/use-vendor-ratings';
import { VendorRatingTab } from '../VendorRatingTab';

vi.mock('../../hooks/use-vendor-rating-summary', () => ({
  useVendorRatingSummary: vi.fn(),
}));

vi.mock('../../hooks/use-vendor-ratings', () => ({
  useVendorRatings: vi.fn(),
}));

const mockUseVendorRatingSummary = vi.mocked(useVendorRatingSummary);
const mockUseVendorRatings = vi.mocked(useVendorRatings);

describe('VendorRatingTab', () => {
  it('does not render the show all categories switch', () => {
    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4,
          totalRatings: 1,
          lastRatedAt: '2026-07-15 00:00:00',
          perCategory: [],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseVendorRatings.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [],
        meta: {
          currentPage: 1,
          perPage: 20,
          total: 0,
          lastPage: 1,
          from: null,
          to: null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<VendorRatingTab vendorId="vendor-1" />);

    expect(
      screen.queryByRole('switch', { name: 'Tampilkan semua kategori' })
    ).not.toBeInTheDocument();
  });

  it('does not render the summary section in the rating tab', () => {
    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4,
          totalRatings: 1,
          lastRatedAt: '2026-07-15 00:00:00',
          perCategory: [],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseVendorRatings.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [],
        meta: {
          currentPage: 1,
          perPage: 20,
          total: 0,
          lastPage: 1,
          from: null,
          to: null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<VendorRatingTab vendorId="vendor-1" />);

    expect(screen.queryByText('Ringkasan Rating')).not.toBeInTheDocument();
    expect(screen.queryByText('Overall Score')).not.toBeInTheDocument();
  });

  it('renders rating history as a table with category columns', () => {
    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4,
          totalRatings: 1,
          lastRatedAt: '2026-07-15 00:00:00',
          perCategory: [
            {
              categoryId: 'cat-1',
              categoryCode: 'capability',
              categoryName: 'Capability',
              avgScore: 4,
              count: 1,
              isActive: true,
            },
            {
              categoryId: 'cat-2',
              categoryCode: 'responsibility',
              categoryName: 'Responsibility',
              avgScore: 4,
              count: 1,
              isActive: true,
            },
            {
              categoryId: 'cat-3',
              categoryCode: 'quality',
              categoryName: 'Quality',
              avgScore: 4,
              count: 1,
              isActive: true,
            },
            {
              categoryId: 'cat-4',
              categoryCode: 'timeliness',
              categoryName: 'Timeliness',
              avgScore: 4,
              count: 1,
              isActive: true,
            },
            {
              categoryId: 'cat-5',
              categoryCode: 'communication',
              categoryName: 'Communication',
              avgScore: 4,
              count: 1,
              isActive: true,
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseVendorRatings.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [
          {
            id: 'rating-1',
            ratedAt: '2026-07-15T00:00:00+00:00',
            overallScore: 3.8,
            note: 'Vendor responsif',
            ratedBy: { id: 'user-1', name: 'Mobile Admin' },
            source: {
              type: 'purchase_order',
              id: 'po-1',
              label: 'RATE-PO-1-1',
              deleted: false,
            },
            scores: [
              {
                categoryId: 'cat-1',
                categoryCode: 'capability',
                categoryName: 'Capability',
                categoryStatus: 'active',
                score: 3,
                note: null,
              },
              {
                categoryId: 'cat-2',
                categoryCode: 'responsibility',
                categoryName: 'Responsibility',
                categoryStatus: 'active',
                score: 4,
                note: 'Cukup baik',
              },
              {
                categoryId: 'cat-3',
                categoryCode: 'quality',
                categoryName: 'Quality',
                categoryStatus: 'active',
                score: 5,
                note: 'Bagus',
              },
              {
                categoryId: 'cat-4',
                categoryCode: 'timeliness',
                categoryName: 'Timeliness',
                categoryStatus: 'active',
                score: 3,
                note: null,
              },
              {
                categoryId: 'cat-5',
                categoryCode: 'communication',
                categoryName: 'Communication',
                categoryStatus: 'active',
                score: 4,
                note: null,
              },
            ],
          },
        ],
        meta: {
          currentPage: 1,
          perPage: 20,
          total: 1,
          lastPage: 1,
          from: 1,
          to: 1,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<VendorRatingTab vendorId="vendor-1" />);

    expect(screen.getByRole('columnheader', { name: 'Info PO' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Capability' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Responsibility' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Quality' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Timeliness' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Communication' })).toBeInTheDocument();

    const poLink = screen.getByRole('link', { name: 'RATE-PO-1-1' });
    const row = poLink.closest('tr');

    expect(row).not.toBeNull();
    expect(row).toHaveTextContent('Mobile Admin');
    expect(row).toHaveTextContent('4 / 5');
    expect(row).toHaveTextContent('3 / 5');
    expect(row).toHaveTextContent('4 / 5');
    expect(row).toHaveTextContent('5 / 5');
  });

  it('shows a search field and filters rating history rows by search text', async () => {
    const user = userEvent.setup();

    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4,
          totalRatings: 2,
          lastRatedAt: '2026-07-15 00:00:00',
          perCategory: [
            {
              categoryId: 'cat-1',
              categoryCode: 'capability',
              categoryName: 'Capability',
              avgScore: 4,
              count: 2,
              isActive: true,
            },
            {
              categoryId: 'cat-2',
              categoryCode: 'responsibility',
              categoryName: 'Responsibility',
              avgScore: 4,
              count: 2,
              isActive: true,
            },
            {
              categoryId: 'cat-3',
              categoryCode: 'quality',
              categoryName: 'Quality',
              avgScore: 4,
              count: 2,
              isActive: true,
            },
            {
              categoryId: 'cat-4',
              categoryCode: 'timeliness',
              categoryName: 'Timeliness',
              avgScore: 4,
              count: 2,
              isActive: true,
            },
            {
              categoryId: 'cat-5',
              categoryCode: 'communication',
              categoryName: 'Communication',
              avgScore: 4,
              count: 2,
              isActive: true,
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseVendorRatings.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [
          {
            id: 'rating-1',
            ratedAt: '2026-07-15T00:00:00+00:00',
            overallScore: 3.8,
            note: 'Vendor responsif',
            ratedBy: { id: 'user-1', name: 'Mobile Admin' },
            source: {
              type: 'purchase_order',
              id: 'po-1',
              label: 'RATE-PO-1-1',
              deleted: false,
            },
            scores: [
              {
                categoryId: 'cat-1',
                categoryCode: 'capability',
                categoryName: 'Capability',
                categoryStatus: 'active',
                score: 3,
                note: null,
              },
              {
                categoryId: 'cat-2',
                categoryCode: 'responsibility',
                categoryName: 'Responsibility',
                categoryStatus: 'active',
                score: 4,
                note: 'Cukup baik',
              },
              {
                categoryId: 'cat-3',
                categoryCode: 'quality',
                categoryName: 'Quality',
                categoryStatus: 'active',
                score: 5,
                note: 'Bagus',
              },
              {
                categoryId: 'cat-4',
                categoryCode: 'timeliness',
                categoryName: 'Timeliness',
                categoryStatus: 'active',
                score: 3,
                note: null,
              },
              {
                categoryId: 'cat-5',
                categoryCode: 'communication',
                categoryName: 'Communication',
                categoryStatus: 'active',
                score: 4,
                note: null,
              },
            ],
          },
          {
            id: 'rating-2',
            ratedAt: '2026-07-14T00:00:00+00:00',
            overallScore: 4.5,
            note: 'Vendor tepat waktu',
            ratedBy: { id: 'user-2', name: 'Admin Procurement' },
            source: {
              type: 'purchase_order',
              id: 'po-2',
              label: 'RATE-PO-2-2',
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
                score: 5,
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
                score: 5,
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
        ],
        meta: {
          currentPage: 1,
          perPage: 20,
          total: 2,
          lastPage: 1,
          from: 1,
          to: 2,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<VendorRatingTab vendorId="vendor-1" />);

    expect(screen.getByPlaceholderText('Cari rating')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Cari rating');
    await user.type(searchInput, 'RATE-PO-2-2');

    expect(screen.queryByRole('link', { name: 'RATE-PO-1-1' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'RATE-PO-2-2' })).toBeInTheDocument();
  });

  it('keeps the table shell visible when the history is empty', () => {
    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: null,
          totalRatings: 0,
          lastRatedAt: null,
          perCategory: [],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseVendorRatings.mockReturnValue({
      data: {
        success: true,
        message: 'Data tidak ditemukan.',
        data: [],
        meta: {
          currentPage: 1,
          perPage: 20,
          total: 0,
          lastPage: 1,
          from: null,
          to: null,
        },
        links: { first: null, last: null, prev: null, next: null },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<VendorRatingTab vendorId="vendor-1" />);

    expect(screen.getByRole('columnheader', { name: 'Info PO' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Belum ada rating untuk vendor ini.' })
    ).toBeInTheDocument();
    expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
  });
});
