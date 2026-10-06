import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PROJECT_CAPABILITY_LABELS } from '../../constants';
import { ProjectCapabilityListPage } from '../ProjectCapabilityListPage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/project-capability',
  useSearchParams: () => new URLSearchParams(),
}));

describe('ProjectCapabilityListPage Integration', () => {
  it('renders without crashing', async () => {
    render(<ProjectCapabilityListPage />);
    expect(await screen.findByText(PROJECT_CAPABILITY_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('fetches and displays the mock data', async () => {
    render(<ProjectCapabilityListPage />);
    await waitFor(() => {
      expect(screen.getByText('High Rise Building')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<ProjectCapabilityListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Design');

    await waitFor(() => {
      expect(screen.getByText('High Rise Building')).toBeInTheDocument();
    });
  });

  it('handles deleting a project capability', async () => {
    const user = userEvent.setup();

    server.use(
      http.delete(getApiPath('/project-capabilities/:id'), () => {
        return HttpResponse.json({ success: true, message: 'Deleted successfully' });
      })
    );

    render(<ProjectCapabilityListPage />);

    // Find the action button (EllipsisVertical)
    await waitFor(() => {
      expect(screen.getByText('High Rise Building')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );

    if (!ellipsisButton) throw new Error('Action button not found');

    await user.click(ellipsisButton);

    // Click delete in dropdown
    const deleteMenuItem = await screen.findByText(PROJECT_CAPABILITY_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    // Confirm dialog should appear
    expect(screen.getByText(PROJECT_CAPABILITY_LABELS.DIALOG.DELETE_TITLE)).toBeInTheDocument();

    const confirmButton = await screen.findByRole('button', { name: /Delete|Hapus/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.queryByText(PROJECT_CAPABILITY_LABELS.DIALOG.DELETE_TITLE)
      ).not.toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/project-capabilities'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ProjectCapabilityListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
