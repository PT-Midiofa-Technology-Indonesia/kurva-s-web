import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { HIERARCHY_MANAGEMENT_LABELS } from '../../constants';
import { HierarchyManagementListPage } from '../HierarchyManagementListPage';

const mockPush = vi.fn();
const mockSearchParamsRef = { value: new URLSearchParams('companyId=1') };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParamsRef.value,
}));

describe('HierarchyManagementListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockSearchParamsRef.value = new URLSearchParams('companyId=1');
  });

  it('renders without crashing', () => {
    render(<HierarchyManagementListPage />);
  });

  it('displays page title as heading', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        HIERARCHY_MANAGEMENT_LABELS.LIST.TITLE
      );
    });
  });

  it('shows search input', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  it('renders company select and status filter', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      // Company select + status select = at least 2 comboboxes
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('loads company options from API', async () => {
    const user = userEvent.setup();
    render(<HierarchyManagementListPage />);

    // Open the company combobox (first combobox in the page)
    const comboboxes = await screen.findAllByRole('combobox');
    await user.click(comboboxes[0]);

    // Generic handler returns code: 'TEST-01', name: 'Test Item' → label "TEST-01 - Test Item"
    await waitFor(() => {
      expect(screen.getAllByText(/Test Item/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches and displays the mock table data', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Position')).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders view toggle with Table, Tree, and Diagram options', async () => {
    render(<HierarchyManagementListPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Table' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tree' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Diagram' })).toBeInTheDocument();
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<HierarchyManagementListPage />);

    const searchInput = await screen.findByPlaceholderText('Search...');
    await user.type(searchInput, 'Test');

    await waitFor(() => {
      expect(searchInput).toHaveValue('Test');
    });
  });

  it('navigates to create page on add button click', async () => {
    const user = userEvent.setup();
    render(<HierarchyManagementListPage />);

    const addButton = await screen.findByRole('button', {
      name: HIERARCHY_MANAGEMENT_LABELS.LIST.ADD_BUTTON,
    });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/hierarchy/create?companyId=1');
  });

  it('switches to tree view and shows tree content', async () => {
    mockSearchParamsRef.value = new URLSearchParams('companyId=1&view=tree');

    render(<HierarchyManagementListPage />);

    await waitFor(() => {
      // OrgTree renders position name from mock data
      expect(screen.getByText('Test Position')).toBeInTheDocument();
    });
  });

  it('switches to diagram view and shows diagram content', async () => {
    mockSearchParamsRef.value = new URLSearchParams('companyId=1&view=diagram');

    render(<HierarchyManagementListPage />);

    await waitFor(() => {
      // OrgChart renders position name from mock data
      expect(screen.getByText('Test Position')).toBeInTheDocument();
    });
  });

  it('displays error message when table API fails', async () => {
    server.use(
      http.get(getApiPath('/company-positions/list'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<HierarchyManagementListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
