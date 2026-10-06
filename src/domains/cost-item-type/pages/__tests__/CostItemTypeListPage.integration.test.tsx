import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { COST_ITEM_TYPE_LABELS } from '../../constants';
import { CostItemTypeListPage } from '../CostItemTypeListPage';

// Mock navigation
const mockPush = vi.fn();
const pushStateMock = vi.spyOn(window.history, 'pushState');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/master-data/cost-item-type',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('CostItemTypeListPage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<CostItemTypeListPage />);

    expect(await screen.findByText(COST_ITEM_TYPE_LABELS.LIST.TITLE)).toBeInTheDocument();

    // Wait for the generic mock data to appear
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    pushStateMock.mockClear();
    render(<CostItemTypeListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Design');

    await waitFor(() => {
      expect(pushStateMock).toHaveBeenCalled();
    });
  });

  it('does not render row action controls while actions column is disabled', async () => {
    render(<CostItemTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    expect(screen.queryByText(COST_ITEM_TYPE_LABELS.LIST.ACTIONS.DELETE)).not.toBeInTheDocument();
    expect(screen.queryByText(COST_ITEM_TYPE_LABELS.LIST.ACTIONS.EDIT)).not.toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/cost-item-types'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<CostItemTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
