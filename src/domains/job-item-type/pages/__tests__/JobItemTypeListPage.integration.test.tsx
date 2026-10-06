import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { JOB_ITEM_TYPE_LABELS } from '../../constants';
import { JobItemTypeListPage } from '../JobItemTypeListPage';

// Mock navigation
const mockPush = vi.fn();
const pushStateMock = vi.spyOn(window.history, 'pushState');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/master-data/job-item-type',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('JobItemTypeListPage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<JobItemTypeListPage />);

    expect(await screen.findByText(JOB_ITEM_TYPE_LABELS.LIST.TITLE)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    pushStateMock.mockClear();
    render(<JobItemTypeListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Design');

    await waitFor(() => {
      expect(pushStateMock).toHaveBeenCalled();
    });

    const lastCall = pushStateMock.mock.calls[pushStateMock.mock.calls.length - 1] ?? [];
    const url = lastCall[2] as string;
    expect(url).toContain('search=Design');
  });

  it('handles deletion', async () => {
    const user = userEvent.setup();

    server.use(
      http.delete(getApiPath('/job-item-types/:id'), () => {
        return HttpResponse.json({ success: true, message: 'Deleted successfully' });
      })
    );

    render(<JobItemTypeListPage />);

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    // Open actions
    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');
    await user.click(ellipsisButton);

    // Click delete
    const deleteButton = await screen.findByText(JOB_ITEM_TYPE_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteButton);

    // Confirm
    const confirmButton = await screen.findByRole('button', { name: /Delete|Hapus/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(JOB_ITEM_TYPE_LABELS.DIALOG.DELETE_TITLE)).not.toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/job-item-types'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<JobItemTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
