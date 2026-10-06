import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/utils/test-utils';
import { ASSET_CATEGORY_LABELS } from '../../constants';
import type { AssetCategoryListItem } from '../../types';
import { AssetCategoryPage } from '../AssetCategoryPage';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => '/asset-management/asset-category',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/shared/hooks/use-enums', () => ({
  useDepreciationMethods: () => ({
    data: [{ value: 'straight_line', label: 'Straight Line' }],
  }),
}));

vi.mock('@/domains/asset-management/hooks/use-asset-category-page', () => ({
  useAssetCategoryPage: () => ({
    assetCategories: [
      {
        id: 'asset-category-1',
        code: 'CAT-001',
        name: 'Laptop',
        usefulLifeMonths: 48,
        depreciationMethod: 'straight_line',
        salvageValuePercent: '10.00',
        maintenanceIntervalMonths: 6,
        requiresSerial: true,
        notes: null,
        isActive: true,
        isProtected: true,
        activeRegistrationsCount: 3,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      } satisfies AssetCategoryListItem,
    ],
    totalItems: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    deleteTarget: null,
    setDeleteTarget: vi.fn(),
    isDeleting: false,
    handleDeleteClick: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleAdd: vi.fn(),
    handleEdit: vi.fn(),
    detailTarget: null,
    handleDetail: vi.fn(),
    handleDetailClose: vi.fn(),
    handleDetailEdit: vi.fn(),
    handleSearchChange: vi.fn(),
    handleIsActiveChange: vi.fn(),
    handleDepreciationMethodChange: vi.fn(),
    handleSort: vi.fn(),
    handlePaginationChange: vi.fn(),
  }),
}));

describe('AssetCategoryPage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('does not render protected label and still exposes delete action', async () => {
    const user = userEvent.setup();

    render(<AssetCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('CAT-001')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(screen.queryByText('Protected')).not.toBeInTheDocument();

    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((button) =>
      button.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');

    await user.click(ellipsisButton);

    expect(await screen.findByText(ASSET_CATEGORY_LABELS.LIST.ACTIONS.DELETE)).toBeInTheDocument();
  });
});
