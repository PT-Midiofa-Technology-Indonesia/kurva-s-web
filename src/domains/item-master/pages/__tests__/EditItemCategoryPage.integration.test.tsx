import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATALOG_LABELS, ITEM_CATEGORY_LABELS, ITEM_MASTER_TABS } from '../../constants';
import { EditItemCategoryPage } from '../../pages/EditItemCategoryPage';

const mockPush = vi.fn();
const mockSearchParamsRef = { value: new URLSearchParams('tab=item-category') };
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: mockItemCategory.id }),
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master/[id]/edit',
  useSearchParams: () => mockSearchParamsRef.value,
}));

const mockItemTypes = [
  {
    id: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
    code: 'MTL',
    name: 'Material',
    description: 'Material type',
    isActive: true,
    createdAt: '2026-05-19T08:46:28.000000Z',
    updatedAt: '2026-05-19T08:46:28.000000Z',
  },
];

const mockItemCategory = {
  id: '019e3f6e-983c-722e-8a0d-be2f8c33231a',
  groupId: null,
  group: null,
  itemTypeId: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
  itemType: { id: '019e3f6a-4173-705c-aa00-4ff62c419fc9', name: 'Material' },
  parentId: null,
  parent: null,
  children: [],
  code: 'CAT-001',
  name: 'Bahan Bangunan',
  description: 'Kategori bahan',
  isActive: true,
  createdAt: '2026-05-19T08:51:13.000000Z',
  updatedAt: '2026-05-19T08:51:13.000000Z',
};

describe('EditItemCategoryPage Integration', () => {
  beforeEach(() => {
    mockSearchParamsRef.value = new URLSearchParams('tab=item-category');
    server.use(
      http.get(getApiPath('/item-types'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data tipe item berhasil diambil.',
          data: mockItemTypes,
          meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
          links: { first: null, last: null, prev: null, next: null },
        });
      }),
      http.get(getApiPath(`/item-categories/${mockItemCategory.id}`), () => {
        return HttpResponse.json({
          success: true,
          message: 'Detail kategori item berhasil diambil.',
          data: mockItemCategory,
        });
      })
    );
  });

  it('renders item catalog edit page when tab is item-catalog', async () => {
    mockSearchParamsRef.value = new URLSearchParams(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`);
    server.use(
      http.get(getApiPath('/item-catalogs/:id'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Detail item catalog berhasil diambil.',
          data: {
            id: '019e3f71-0000-7000-8000-000000000001',
            groupId: null,
            group: null,
            itemTypeId: mockItemTypes[0].id,
            itemType: { id: mockItemTypes[0].id, name: mockItemTypes[0].name },
            itemCategoryId: mockItemCategory.id,
            itemCategory: { id: mockItemCategory.id, name: mockItemCategory.name },
            uomId: '019e3f70-0000-7000-8000-000000000001',
            uom: { id: '019e3f70-0000-7000-8000-000000000001', name: 'Pieces', code: 'PCS' },
            code: 'ICT-001',
            name: 'Semen 50kg',
            description: '',
            isAllocatable: true,
            isAsset: false,
            isStock: true,
            isSensitive: false,
            defaultPrice: 65000,
            isActive: true,
            createdAt: '2026-05-21T00:00:00.000000Z',
            updatedAt: '2026-05-21T00:00:00.000000Z',
          },
        });
      }),
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: [mockItemCategory],
          meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
          links: { first: null, last: null, prev: null, next: null },
        });
      }),
      http.get(getApiPath('/uoms'), () => {
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: [
            {
              id: '019e3f70-0000-7000-8000-000000000001',
              group: 'Unit',
              code: 'PCS',
              name: 'Pieces',
              description: null,
              isActive: true,
              createdAt: '2026-05-19T08:46:28.000000Z',
              updatedAt: '2026-05-19T08:46:28.000000Z',
            },
          ],
          meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );

    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATALOG_LABELS.FORM.EDIT_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('renders the edit form with correct title', async () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATEGORY_LABELS.FORM.EDIT_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('loads and displays existing category data', async () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('CAT-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bahan Bangunan')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Kategori bahan')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    expect(screen.queryByDisplayValue('CAT-001')).not.toBeInTheDocument();
  });

  it('displays not found state when category does not exist', async () => {
    server.use(
      http.get(getApiPath('/item-categories/invalid-id'), () => {
        return HttpResponse.json(null);
      })
    );

    render(<EditItemCategoryPage itemCategoryId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.NOT_FOUND)).toBeInTheDocument();
    });
  });

  it('renders back button with correct label', async () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    const backButtons = await screen.findAllByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.BACK,
    });
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('navigates back when back button clicked', async () => {
    const user = userEvent.setup();
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    const backButtons = await screen.findAllByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.BACK,
    });

    if (backButtons.length > 0) {
      await user.click(backButtons[0]);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    }
  });

  it('updates category and shows confirm dialog', async () => {
    const user = userEvent.setup();
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    const nameInput = await screen.findByDisplayValue('Bahan Bangunan');
    await user.clear(nameInput);
    await user.type(nameInput, 'Bahan Bangunan Updated');

    const submitButton = screen.getByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE_CHANGE,
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_EDIT_TITLE)).toBeInTheDocument();
    });
  });

  it('updates category and navigates back on confirm', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath(`/item-categories/${mockItemCategory.id}`), () => {
        return HttpResponse.json({
          success: true,
          message: 'Kategori item berhasil diperbarui.',
          data: {
            ...mockItemCategory,
            name: 'Bahan Bangunan Updated',
            updatedAt: '2026-05-20T00:00:00.000000Z',
          },
        });
      })
    );

    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    const nameInput = await screen.findByDisplayValue('Bahan Bangunan');
    await user.clear(nameInput);
    await user.type(nameInput, 'Bahan Bangunan Updated');

    const submitButton = screen.getByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE_CHANGE,
    });

    await user.click(submitButton);

    const confirmButton = await screen.findByRole('button', {
      name: ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/item-master?tab=item-category');
    });
  });

  it('preserves item type value during edit', async () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    await waitFor(() => {
      const itemTypeLabel = screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE);
      expect(itemTypeLabel).toBeInTheDocument();
    });
  });

  it('renders form successfully with data loaded', async () => {
    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('CAT-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bahan Bangunan')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath(`/item-categories/${mockItemCategory.id}`), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Gagal memperbarui kategori item',
            data: null,
            errorCode: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      })
    );

    render(<EditItemCategoryPage itemCategoryId={mockItemCategory.id} />);

    const nameInput = await screen.findByDisplayValue('Bahan Bangunan');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const submitButton = screen.getByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE_CHANGE,
    });

    await user.click(submitButton);

    const confirmButton = await screen.findByRole('button', {
      name: ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE,
    });
    await user.click(confirmButton);

    // Error should be displayed in the toast
    await waitFor(() => {
      expect(screen.getByText('Gagal memperbarui kategori item')).toBeInTheDocument();
    });
  });
});
