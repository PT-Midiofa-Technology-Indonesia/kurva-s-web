import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PAYMENT_TYPE_LABELS } from '../../constants';
import { PaymentTypeListPage } from '../PaymentTypeListPage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/payment-type',
  useSearchParams: () => new URLSearchParams(),
}));

describe('PaymentTypeListPage Integration', () => {
  it('renders without crashing', async () => {
    render(<PaymentTypeListPage />);
    expect(await screen.findByText(PAYMENT_TYPE_LABELS.LIST.TITLE)).toBeInTheDocument();
  });

  it('fetches and displays the mock data', async () => {
    render(<PaymentTypeListPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<PaymentTypeListPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'Bank Transfer');

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('does not render delete action while actions column is disabled', async () => {
    render(<PaymentTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    expect(screen.queryByText(PAYMENT_TYPE_LABELS.LIST.ACTIONS.DELETE)).not.toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/payment-types'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<PaymentTypeListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
