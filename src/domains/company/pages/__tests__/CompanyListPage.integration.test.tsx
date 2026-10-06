import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS } from '../../constants';
import { CompanyListPage } from '../CompanyListPage';

const mockPush = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/organization/company',
  useSearchParams: () => mockUseSearchParams(),
}));

describe('CompanyListPage Integration', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseSearchParams.mockReset();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CompanyListPage />);
  });

  it('displays page title as heading', async () => {
    render(<CompanyListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        COMPANY_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<CompanyListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<CompanyListPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('restores status filter from query params on refresh', async () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('isActive=true'));

    render(<CompanyListPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('Aktif');
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<CompanyListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<CompanyListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<CompanyListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'PT');

    await waitFor(() => {
      expect(searchInput).toHaveValue('PT');
    });
  });

  it('navigates to create page on add button click', async () => {
    const user = userEvent.setup();
    render(<CompanyListPage />);

    const addButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.LIST.ADD_BUTTON,
    });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company/create');
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/companies'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<CompanyListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
