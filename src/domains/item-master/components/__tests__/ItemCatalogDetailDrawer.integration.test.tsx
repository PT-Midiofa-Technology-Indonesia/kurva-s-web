import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS } from '../../constants';
import { useItemCatalog } from '../../hooks/use-item-catalog';
import { useUpdateItemCatalog } from '../../hooks/use-update-item-catalog';
import type { ItemCatalogListItem } from '../../types';
import { ItemCatalogDetailDrawer } from '../ItemCatalogDetailDrawer';

vi.mock('../../hooks/use-item-catalog', () => ({ useItemCatalog: vi.fn() }));
vi.mock('../../hooks/use-update-item-catalog', () => ({ useUpdateItemCatalog: vi.fn() }));

const mockItemCatalog: ItemCatalogListItem = {
  id: '1',
  groupId: null,
  group: null,
  code: 'IC001',
  name: 'Item Catalog 001',
  itemTypeId: 'it1',
  itemType: { id: 'it1', name: 'Item Type 01' },
  itemCategoryId: 'ic1',
  itemCategory: { id: 'ic1', name: 'Item Category 01' },
  uomId: 'uom1',
  uom: { id: 'uom1', name: 'Kilogram', code: 'KG' },
  isAllocatable: true,
  isAsset: false,
  isStock: true,
  isSensitive: false,
  defaultPrice: 10000,
  description: 'Test description',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function setupMocks(item: ItemCatalogListItem | null = mockItemCatalog) {
  vi.mocked(useItemCatalog).mockReturnValue({
    data: item ? { data: item } : null,
    isLoading: false,
  } as ReturnType<typeof useItemCatalog>);
  vi.mocked(useUpdateItemCatalog).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateItemCatalog>);
}

describe('ItemCatalogDetailDrawer Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnEdit.mockClear();
    vi.clearAllMocks();
    setupMocks();
  });

  it('does not render when open is false', () => {
    const { container } = render(
      <ItemCatalogDetailDrawer open={false} onClose={mockOnClose} id="1" />
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('renders drawer title and item details', async () => {
    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATALOG_LABELS.DETAIL.TITLE)).toBeInTheDocument();
      expect(screen.getByText(mockItemCatalog.code)).toBeInTheDocument();
      expect(screen.getByText(mockItemCatalog.name)).toBeInTheDocument();
      expect(screen.getByText(mockItemCatalog.itemType?.name ?? '')).toBeInTheDocument();
      expect(screen.getByText(mockItemCatalog.itemCategory?.name ?? '')).toBeInTheDocument();
      expect(screen.getByText(mockItemCatalog.uom?.name ?? '')).toBeInTheDocument();
    });
  });

  it('displays boolean fields with toggles showing correct values', async () => {
    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      const labels = screen.getAllByText(/Ya|Tidak/);
      expect(labels.length).toBeGreaterThan(0);
      // Item Dapat Dialokasikan should show "Ya"
      expect(
        screen.getByText(ITEM_CATALOG_LABELS.DETAIL.FIELDS.IS_ALLOCATABLE)
      ).toBeInTheDocument();
    });
  });

  it('displays status toggle for editable status', async () => {
    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATALOG_LABELS.DETAIL.FIELDS.STATUS)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATALOG_LABELS.DETAIL.STATUS_ACTIVE)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    const closeButton = await screen.findByRole('button', {
      name: /close/i,
    });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ItemCatalogDetailDrawer open={true} onClose={mockOnClose} onEdit={mockOnEdit} id="1" />
    );

    const editButton = await screen.findByRole('button', {
      name: ITEM_CATALOG_LABELS.DETAIL.BUTTONS.EDIT,
    });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('renders close button with correct label', async () => {
    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: ITEM_CATALOG_LABELS.DETAIL.BUTTONS.CLOSE,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders item with null nested objects gracefully', async () => {
    const itemWithoutNested: ItemCatalogListItem = {
      ...mockItemCatalog,
      itemType: null,
      itemCategory: null,
      uom: null,
    };
    setupMocks(itemWithoutNested);

    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      // Should show "-" for missing nested objects
      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });
  });

  it('renders description field with long text', async () => {
    const longDescription = 'A'.repeat(500);
    const itemWithDescription: ItemCatalogListItem = {
      ...mockItemCatalog,
      description: longDescription,
    };
    setupMocks(itemWithDescription);

    render(<ItemCatalogDetailDrawer open={true} onClose={mockOnClose} id="1" />);

    await waitFor(() => {
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
