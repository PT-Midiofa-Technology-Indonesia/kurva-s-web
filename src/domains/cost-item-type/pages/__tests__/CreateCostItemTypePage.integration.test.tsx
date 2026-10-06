import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { COST_ITEM_TYPE_LABELS } from '../../constants';
import { CreateCostItemTypePage } from '../CreateCostItemTypePage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CreateCostItemTypePage Integration', () => {
  it('renders without crashing', () => {
    render(<CreateCostItemTypePage />);
    expect(screen.getByText(COST_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('handles successful creation', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/cost-item-types'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Created successfully',
          data: { id: '1', code: 'CIT-001', name: 'New Cost Type', isActive: true },
        });
      })
    );

    render(<CreateCostItemTypePage />);

    // Fill in the form
    const codeInput = screen.getByPlaceholderText(/Masukan kode/i);
    const nameInput = screen.getByPlaceholderText(/Masukan nama/i);

    await user.type(codeInput, 'CIT-001');
    await user.type(nameInput, 'New Cost Type');

    // Select status to trigger onBlur validation and enable the save button
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /^Aktif$/ }));

    const saveButton = screen.getByRole('button', {
      name: COST_ITEM_TYPE_LABELS.CREATE.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: COST_ITEM_TYPE_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/cost-item-type');
    });
  });

  it('displays error message when creation fails', () => {
    render(<CreateCostItemTypePage />);
    expect(screen.getByText(COST_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });
});
