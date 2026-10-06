import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PAYMENT_TYPE_LABELS } from '../../constants';
import { EditPaymentTypePage } from '../EditPaymentTypePage';

// Mock navigation
const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

describe('EditPaymentTypePage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<EditPaymentTypePage />);

    expect(await screen.findByText(PAYMENT_TYPE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item Detail')).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<EditPaymentTypePage />);

    // Wait for data
    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Payment Type');

    // Click save
    const saveButton = screen.getByRole('button', { name: PAYMENT_TYPE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog
    const confirmButton = await screen.findByRole('button', {
      name: PAYMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/payment-type');
    });
  });

  it('displays error message when fetching fails', async () => {
    server.use(
      http.get(getApiPath('/payment-types/1'), () => {
        return HttpResponse.json({ message: 'Payment type tidak ditemukan' }, { status: 404 });
      })
    );

    render(<EditPaymentTypePage />);

    await waitFor(() => {
      expect(screen.getByText(/Payment type tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/payment-types/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditPaymentTypePage />);

    await screen.findByDisplayValue('Test Item Detail');
    const saveButton = screen.getByRole('button', { name: PAYMENT_TYPE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: PAYMENT_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
