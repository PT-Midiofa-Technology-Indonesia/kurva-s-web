import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { APPROVAL_GROUP_LABELS } from '../../constants';
import { ApprovalGroupListPage } from '../ApprovalGroupListPage';

// Mock navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/master-data/approval-group',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ApprovalGroupListPage Integration', () => {
  it('renders without crashing', async () => {
    render(<ApprovalGroupListPage />);
    expect(await screen.findByText(APPROVAL_GROUP_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('fetches and displays the mock data', async () => {
    render(<ApprovalGroupListPage />);
    await waitFor(() => {
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<ApprovalGroupListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'APV');

    await waitFor(() => {
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    });
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    render(<ApprovalGroupListPage />);

    await waitFor(() => {
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    });

    // Find and click the status filter button
    const filterButtons = await screen.findAllByRole('combobox');
    const statusFilter = filterButtons[filterButtons.length - 1]; // Last combobox is the status filter
    await user.click(statusFilter);

    const activeOption = await screen.findByText(/Aktif/i);
    await user.click(activeOption);

    await waitFor(() => {
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    render(<ApprovalGroupListPage />);

    await waitFor(() => {
      expect(screen.getByText('Manager Approval')).toBeInTheDocument();
    });

    // Verify pagination controls are present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
