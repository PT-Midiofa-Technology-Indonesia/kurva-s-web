import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { WAREHOUSE_LABELS } from '../../constants';
import { WarehouseListPage } from '../WarehouseListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('WarehouseListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<WarehouseListPage />);
  });

  it('displays page title as heading', async () => {
    render(<WarehouseListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        WAREHOUSE_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<WarehouseListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<WarehouseListPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<WarehouseListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<WarehouseListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<WarehouseListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'WH');

    await waitFor(() => {
      expect(searchInput).toHaveValue('WH');
    });
  });

  it('navigates to create page on add button click', async () => {
    const user = userEvent.setup();
    render(<WarehouseListPage />);

    const addButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.LIST.ADD_BUTTON,
    });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/warehouse/create');
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/warehouses'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<WarehouseListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
