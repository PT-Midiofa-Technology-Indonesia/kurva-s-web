import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { COST_ITEM_TYPE_LABELS } from '../../constants';
import { EditCostItemTypePage } from '../EditCostItemTypePage';

// Mock navigation
const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

describe('EditCostItemTypePage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<EditCostItemTypePage />);

    expect(await screen.findByText(COST_ITEM_TYPE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item Detail')).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<EditCostItemTypePage />);

    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    fireEvent.change(nameInput, { target: { value: 'Updated Cost Type' } });

    const saveButton = screen.getByRole('button', {
      name: COST_ITEM_TYPE_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: COST_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/master-data/cost-item-type');
      },
      { timeout: 10000 }
    );
  });

  it('displays error message when fetching fails', async () => {
    server.use(
      http.get(getApiPath('/cost-item-types/1'), () => {
        return HttpResponse.json({ message: 'Cost item type tidak ditemukan' }, { status: 404 });
      })
    );

    render(<EditCostItemTypePage />);

    await waitFor(() => {
      expect(screen.getByText(/Cost item type tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/cost-item-types/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditCostItemTypePage />);

    await screen.findByDisplayValue('Test Item Detail');
    const saveButton = screen.getByRole('button', {
      name: COST_ITEM_TYPE_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: COST_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
