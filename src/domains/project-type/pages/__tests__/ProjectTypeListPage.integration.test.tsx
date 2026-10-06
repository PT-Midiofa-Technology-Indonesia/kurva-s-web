import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { PROJECT_TYPE_LABELS } from '../../constants';
import { ProjectTypeListPage } from '../ProjectTypeListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ProjectTypeListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<ProjectTypeListPage />);
  });

  it('displays page title as heading', async () => {
    render(<ProjectTypeListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        PROJECT_TYPE_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<ProjectTypeListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('displays status filter', async () => {
    render(<ProjectTypeListPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches and displays the mock data', async () => {
    render(<ProjectTypeListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<ProjectTypeListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<ProjectTypeListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'PT');

    await waitFor(() => {
      expect(searchInput).toHaveValue('PT');
    });
  });

  it('does not render add button while create action is disabled', async () => {
    render(<ProjectTypeListPage />);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: PROJECT_TYPE_LABELS.LIST.ADD_BUTTON })
      ).not.toBeInTheDocument();
    });
  });

  it('does not render delete action while actions column is disabled', async () => {
    render(<ProjectTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    expect(screen.queryByText(PROJECT_TYPE_LABELS.LIST.ACTIONS.DELETE)).not.toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/project-types'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ProjectTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
