import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { VendorCatalogListPage } from '../VendorCatalogListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('VendorCatalogListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<VendorCatalogListPage />);
  });

  it('displays page title as heading', async () => {
    render(<VendorCatalogListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        VENDOR_CATALOG_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<VendorCatalogListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<VendorCatalogListPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<VendorCatalogListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<VendorCatalogListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<VendorCatalogListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'VND');

    await waitFor(() => {
      expect(searchInput).toHaveValue('VND');
    });
  });

  it('navigates to create page on add button click', async () => {
    const user = userEvent.setup();
    render(<VendorCatalogListPage />);

    const addButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.LIST.ADD_BUTTON,
    });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/vendor-management/vendor-catalog/create');
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/vendors'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<VendorCatalogListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
