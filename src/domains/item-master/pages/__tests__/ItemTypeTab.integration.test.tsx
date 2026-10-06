import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ITEM_TYPE_LABELS } from '../../constants';
import { ItemTypeTab } from '../../pages/ItemTypeTab';

const mockPush = vi.fn();
const pushStateMock = vi.spyOn(window.history, 'pushState');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/item-master',
  useSearchParams: () => new URLSearchParams('tab=type'),
  useParams: () => ({}),
}));

const mockItemTypes = [
  {
    id: '019e3f6a-4173-705c-aa00-4ff62c419fc9',
    code: 'MTL',
    name: 'Material',
    description: 'Material / Bahan Bangunan Utama',
    isActive: true,
    createdAt: '2026-05-19T08:46:28.000000Z',
    updatedAt: '2026-05-19T08:46:28.000000Z',
  },
  {
    id: '019e3f6a-4195-709c-9c9e-d1796a0b5e97',
    code: 'EQP',
    name: 'Equipment',
    description: 'Peralatan dan Mesin Konstruksi',
    isActive: false,
    createdAt: '2026-05-19T08:46:28.000000Z',
    updatedAt: '2026-05-19T08:46:28.000000Z',
  },
];

describe('ItemTypeTab Integration', () => {
  it('renders the section title and table columns', async () => {
    render(<ItemTypeTab />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ITEM_TYPE_LABELS.LIST.TITLE })
      ).toBeInTheDocument();
      expect(screen.getByText(ITEM_TYPE_LABELS.LIST.COLUMNS.CODE)).toBeInTheDocument();
      expect(screen.getByText(ITEM_TYPE_LABELS.LIST.COLUMNS.NAME)).toBeInTheDocument();
      expect(screen.getByText(ITEM_TYPE_LABELS.LIST.COLUMNS.STATUS)).toBeInTheDocument();
    });
  });

  it('fetches and displays item type data with correct badges', async () => {
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

    render(<ItemTypeTab />);

    await waitFor(() => {
      expect(screen.getByText('MTL')).toBeInTheDocument();
      expect(screen.getByText('Material')).toBeInTheDocument();
      expect(screen.getByText('EQP')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    expect(screen.getByText(ITEM_TYPE_LABELS.LIST.STATUS.ACTIVE)).toBeInTheDocument();
    expect(screen.getByText(ITEM_TYPE_LABELS.LIST.STATUS.INACTIVE)).toBeInTheDocument();
  });

  it('handles search input and updates URL', async () => {
    const user = userEvent.setup();
    pushStateMock.mockClear();
    render(<ItemTypeTab />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Material');

    await waitFor(() => {
      expect(pushStateMock).toHaveBeenCalled();
    });

    const lastCall = pushStateMock.mock.calls[pushStateMock.mock.calls.length - 1] ?? [];
    const url = lastCall[2] as string;
    expect(url).toContain('search=Material');
  });

  it('renders the status filter dropdown', async () => {
    render(<ItemTypeTab />);

    await waitFor(() => {
      expect(screen.getByText(ITEM_TYPE_LABELS.LIST.FILTERS.STATUS)).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get(getApiPath('/item-types'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ItemTypeTab />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
