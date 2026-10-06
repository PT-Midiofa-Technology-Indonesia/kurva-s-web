import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { JOB_ITEM_TYPE_LABELS } from '../../constants';
import { EditJobItemTypePage } from '../EditJobItemTypePage';

// Mock navigation
const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

describe('EditJobItemTypePage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<EditJobItemTypePage />);

    expect(await screen.findByText(JOB_ITEM_TYPE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item Detail')).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<EditJobItemTypePage />);

    // Wait for data
    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Job Type');

    // Click save
    const saveButton = screen.getByRole('button', { name: JOB_ITEM_TYPE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog
    const confirmButton = await screen.findByRole('button', {
      name: JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/job-item-type');
    });
  });

  it('displays error message when fetching fails', async () => {
    server.use(
      http.get(getApiPath('/job-item-types/1'), () => {
        return HttpResponse.json({ message: 'Job item type tidak ditemukan' }, { status: 404 });
      })
    );

    render(<EditJobItemTypePage />);

    await waitFor(() => {
      expect(screen.getByText(/Job item type tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/job-item-types/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditJobItemTypePage />);

    await screen.findByDisplayValue('Test Item Detail');
    const saveButton = screen.getByRole('button', { name: JOB_ITEM_TYPE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: JOB_ITEM_TYPE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
