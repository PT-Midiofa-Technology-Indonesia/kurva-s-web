import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_CATEGORY_LABELS } from '../../constants';
import { ItemCategoryTab } from '../../pages/ItemCategoryTab';

const mockPush = vi.fn();
const pushStateMock = vi.spyOn(window.history, 'pushState');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master',
  useSearchParams: () => new URLSearchParams('tab=category'),
  useParams: () => ({}),
}));

const mockItemCategories = [
  {
    id: '019e3f6e-983c-722e-8a0d-be2f8c33231a',
    groupId: null,
    group: null,
    itemTypeId: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
    itemType: { id: '019e3f6a-4173-705c-aa00-4ff62c419fc9', name: 'Material' },
    parentId: null,
    parent: null,
    code: 'CAT-001',
    name: 'Bahan Bangunan',
    description: 'Kategori bahan',
    isActive: true,
    createdAt: '2026-05-19T08:51:13.000000Z',
    updatedAt: '2026-05-19T08:51:13.000000Z',
  },
  {
    id: '019e3f6f-1234-5678-9abc-def012345678',
    groupId: null,
    group: null,
    itemTypeId: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
    itemType: { id: '019e3f6a-4173-705c-aa00-4ff62c419fc9', name: 'Material' },
    parentId: null,
    parent: null,
    code: 'CAT-002',
    name: 'Alat Kerja',
    description: 'Kategori alat kerja',
    isActive: false,
    createdAt: '2026-05-19T09:00:00.000000Z',
    updatedAt: '2026-05-19T09:00:00.000000Z',
  },
];

describe('ItemCategoryTab Integration', () => {
  it('renders the list title and table columns', async () => {
    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_CATEGORY_LABELS.LIST.TITLE })
      ).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.COLUMNS.CODE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.COLUMNS.NAME)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.COLUMNS.ITEM_TYPE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.COLUMNS.STATUS)).toBeInTheDocument();
    });
  });

  it('fetches and displays item category data with correct badges', async () => {
    server.use(
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data kategori item berhasil diambil.',
          data: mockItemCategories,
          meta: { currentPage: 1, perPage: 10, total: 2, lastPage: 1, from: 1, to: 2 },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );

    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(screen.getByText('CAT-001')).toBeInTheDocument();
      expect(screen.getByText('Bahan Bangunan')).toBeInTheDocument();
      expect(screen.getByText('CAT-002')).toBeInTheDocument();
      expect(screen.getByText('Alat Kerja')).toBeInTheDocument();
    });

    expect(screen.getAllByText(ITEM_CATEGORY_LABELS.LIST.STATUS.ACTIVE)).toHaveLength(1);
    expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.STATUS.INACTIVE)).toBeInTheDocument();
  });

  it('displays item type name in the table', async () => {
    server.use(
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Data kategori item berhasil diambil.',
          data: mockItemCategories,
          meta: { currentPage: 1, perPage: 10, total: 2, lastPage: 1, from: 1, to: 2 },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );

    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(screen.getAllByText('Material')).toHaveLength(2);
    });
  });

  it('handles search input and updates URL', async () => {
    const user = userEvent.setup();
    pushStateMock.mockClear();
    render(<ItemCategoryTab />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Bahan');

    await waitFor(() => {
      expect(pushStateMock).toHaveBeenCalled();
    });

    const lastCall = pushStateMock.mock.calls[pushStateMock.mock.calls.length - 1] ?? [];
    const url = lastCall[2] as string;
    expect(url).toContain('search=Bahan');
  });

  it('renders the status filter dropdown', async () => {
    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.FILTERS.STATUS)).toBeInTheDocument();
    });
  });

  it('renders add button', async () => {
    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ITEM_CATEGORY_LABELS.LIST.ADD_BUTTON })
      ).toBeInTheDocument();
    });
  });

  it('displays empty state when no categories found', async () => {
    server.use(
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json({
          success: true,
          message: ITEM_CATEGORY_LABELS.LIST.EMPTY,
          data: [],
          meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 1, from: null, to: null },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );

    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_CATEGORY_LABELS.LIST.EMPTY)).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get(getApiPath('/item-categories'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ItemCategoryTab />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
