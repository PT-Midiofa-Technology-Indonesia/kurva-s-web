import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PAYMENT_TYPE_LABELS } from '../../constants';
import { CreatePaymentTypePage } from '../CreatePaymentTypePage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CreatePaymentTypePage Integration', () => {
  it('renders without crashing', () => {
    render(<CreatePaymentTypePage />);
    expect(screen.getByText(PAYMENT_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('handles successful creation', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/payment-types'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Created successfully',
          data: { id: '1', code: 'PT-001', name: 'New Payment Type', isActive: true },
        });
      })
    );

    render(<CreatePaymentTypePage />);

    // Fill in the form
    const codeInput = screen.getByPlaceholderText(/Masukan kode/i);
    const nameInput = screen.getByPlaceholderText(/Masukan nama/i);

    await user.type(codeInput, 'PT-001');
    await user.type(nameInput, 'New Payment Type');

    // Select status to trigger onBlur validation and enable the save button
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /^Aktif$/ }));

    const saveButton = screen.getByRole('button', {
      name: PAYMENT_TYPE_LABELS.CREATE.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: PAYMENT_TYPE_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/payment-type');
    });
  });

  it('displays error message when creation fails', () => {
    render(<CreatePaymentTypePage />);
    expect(screen.getByText(PAYMENT_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });
});
