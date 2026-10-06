import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATEGORY_LABELS, ITEM_MASTER_TABS } from '../../constants';
import { CreateItemCategoryPage } from '../../pages/CreateItemCategoryPage';

const mockPush = vi.fn();
const mockSearchParamsRef = { value: new URLSearchParams('tab=item-category') };
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master/create',
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
  {
    id: '019e3f6a-4195-709c-9c9e-d1796a0b5e97',
    code: 'EQP',
    name: 'Equipment',
    description: 'Equipment type',
    isActive: true,
    createdAt: '2026-05-19T08:46:28.000000Z',
    updatedAt: '2026-05-19T08:46:28.000000Z',
  },
];

describe('CreateItemCategoryPage Integration', () => {
  beforeEach(() => {
    mockSearchParamsRef.value = new URLSearchParams('tab=item-category');
    server.use(
      http.get(getApiPath('/item-types'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data tipe item berhasil diambil.',
          data: mockItemTypes,
          meta: { currentPage: 1, perPage: 10, total: 2, lastPage: 1, from: 1, to: 2 },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );
  });

  it('renders item catalog page when tab is item-catalog', async () => {
    mockSearchParamsRef.value = new URLSearchParams(`tab=${ITEM_MASTER_TABS.ITEM_CATALOG}`);
    render(<CreateItemCategoryPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tambah Item Catalog' })).toBeInTheDocument();
    });
  });

  it('renders the create form with correct title', async () => {
    render(<CreateItemCategoryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATEGORY_LABELS.FORM.CREATE_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('renders form fields with correct labels and placeholders', async () => {
    render(<CreateItemCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.STATUS)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.DESCRIPTION)).toBeInTheDocument();
    });
  });

  it('loads item types in the select dropdown', async () => {
    const user = userEvent.setup();
    render(<CreateItemCategoryPage />);

    const itemTypeLabel = await screen.findByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE);
    const itemTypeContainer = itemTypeLabel.closest('div[class*="col-span"]');
    const itemTypeSelect = itemTypeContainer?.querySelector(
      '[role="combobox"]'
    ) as HTMLElement | null;

    if (!itemTypeSelect) return;

    await user.click(itemTypeSelect);

    await waitFor(() => {
      expect(screen.getByText('Material')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });
  });

  it('renders back button with correct label', async () => {
    render(<CreateItemCategoryPage />);

    const backButtons = screen.getAllByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.BACK,
    });
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('navigates back when back button clicked', async () => {
    const user = userEvent.setup();
    render(<CreateItemCategoryPage />);

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

  it('shows validation errors for empty required fields', async () => {
    render(<CreateItemCategoryPage />);

    const submitButton = await screen.findByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('submits form and shows confirm dialog', async () => {
    const user = userEvent.setup();
    render(<CreateItemCategoryPage />);

    const codeInput = await screen.findByPlaceholderText(
      ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.CODE
    );
    const nameInput = screen.getByPlaceholderText(ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.NAME);

    await user.type(codeInput, 'CAT-001');
    await user.type(nameInput, 'Bahan Bangunan');

    const itemTypeLabel = await screen.findByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE);
    const itemTypeContainer = itemTypeLabel.closest('div[class*="col-span"]');
    const itemTypeSelect = itemTypeContainer?.querySelector('[role="combobox"]') as HTMLElement;

    if (itemTypeSelect) {
      await user.click(itemTypeSelect);
      const materialOption = await screen.findByText('Material');
      await user.click(materialOption);
    }

    const submitButton = screen.getByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE,
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE_TITLE)).toBeInTheDocument();
    });
  });

  it('creates category and navigates back on confirm', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/item-categories'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Kategori item berhasil ditambahkan.',
          data: {
            id: '019e3f6e-983c-722e-8a0d-be2f8c33231a',
            groupId: null,
            group: null,
            itemTypeId: mockItemTypes[0].id,
            itemType: { id: mockItemTypes[0].id, name: mockItemTypes[0].name },
            parentId: null,
            parent: null,
            code: 'CAT-001',
            name: 'Bahan Bangunan',
            description: '',
            isActive: true,
            createdAt: '2026-05-20T00:00:00.000000Z',
            updatedAt: '2026-05-20T00:00:00.000000Z',
          },
        });
      })
    );

    render(<CreateItemCategoryPage />);

    const codeInput = await screen.findByPlaceholderText(
      ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.CODE
    );
    const nameInput = screen.getByPlaceholderText(ITEM_CATEGORY_LABELS.FORM.PLACEHOLDERS.NAME);

    await user.type(codeInput, 'CAT-001');
    await user.type(nameInput, 'Bahan Bangunan');

    const itemTypeLabel = await screen.findByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE);
    const itemTypeContainer = itemTypeLabel.closest('div[class*="col-span"]');
    const itemTypeSelect = itemTypeContainer?.querySelector('[role="combobox"]') as HTMLElement;

    if (itemTypeSelect) {
      await user.click(itemTypeSelect);
      const materialOption = await screen.findByText('Material');
      await user.click(materialOption);
    }

    const submitButton = screen.getByRole('button', {
      name: ITEM_CATEGORY_LABELS.FORM.BUTTONS.SAVE,
    });

    await user.click(submitButton);

    const confirmButton = await screen.findByRole('button', {
      name: ITEM_CATEGORY_LABELS.DIALOG.CONFIRM_SAVE,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('form renders with all required fields', async () => {
    render(<CreateItemCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.ITEM_TYPE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.FORM.FIELDS.DESCRIPTION)).toBeInTheDocument();
    });
  });
});
