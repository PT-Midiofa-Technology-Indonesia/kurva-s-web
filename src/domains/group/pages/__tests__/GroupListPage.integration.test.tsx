import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { GROUP_LABELS } from '../../constants';
import { GroupListPage } from '../GroupListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('GroupListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<GroupListPage />);
  });

  it('displays page title as heading', async () => {
    render(<GroupListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(GROUP_LABELS.LIST.TITLE);
    });
  });

  it('shows search input', async () => {
    render(<GroupListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<GroupListPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<GroupListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<GroupListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<GroupListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'Test');

    await waitFor(() => {
      expect(searchInput).toHaveValue('Test');
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/groups'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<GroupListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
