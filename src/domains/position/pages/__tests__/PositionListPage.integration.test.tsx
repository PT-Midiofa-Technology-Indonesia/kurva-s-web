import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { POSITION_LABELS } from '../../constants';
import { PositionListPage } from '../PositionListPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/position',
  useSearchParams: () => new URLSearchParams(),
}));

describe('PositionListPage Integration', () => {
  it('renders without crashing', async () => {
    render(<PositionListPage />);
    expect(await screen.findByText(POSITION_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('fetches and displays mock data', async () => {
    render(<PositionListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('navigates to create page when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<PositionListPage />);

    const addButton = await screen.findByRole('button', { name: POSITION_LABELS.LIST.ADD_BUTTON });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/position/create');
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<PositionListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Software Engineer');

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('opens delete confirm dialog and calls delete API', async () => {
    const user = userEvent.setup();

    server.use(
      http.delete(getApiPath('/positions/:id'), () => {
        return HttpResponse.json({ success: true, message: 'Position deleted successfully' });
      })
    );

    render(<PositionListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');

    await user.click(ellipsisButton);

    const deleteMenuItem = await screen.findByText(POSITION_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    expect(screen.getByText(POSITION_LABELS.DIALOG.DELETE_TITLE)).toBeInTheDocument();

    const confirmButton = await screen.findByRole('button', { name: /Hapus/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(POSITION_LABELS.DIALOG.DELETE_TITLE)).not.toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get(getApiPath('/positions'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<PositionListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
