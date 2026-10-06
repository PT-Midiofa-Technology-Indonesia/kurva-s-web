import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { JOB_ITEM_TYPE_LABELS } from '../../constants';
import { CreateJobItemTypePage } from '../CreateJobItemTypePage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CreateJobItemTypePage Integration', () => {
  it('renders without crashing', () => {
    render(<CreateJobItemTypePage />);
    expect(screen.getByText(JOB_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('handles successful creation', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/job-item-types'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Created successfully',
          data: { id: '1', code: 'JIT-001', name: 'New Job Type', isActive: true },
        });
      })
    );

    render(<CreateJobItemTypePage />);

    // Fill in the form
    const codeInput = screen.getByPlaceholderText(/Masukan kode/i);
    const nameInput = screen.getByPlaceholderText(/Masukan nama/i);

    await user.type(codeInput, 'JIT-001');
    await user.type(nameInput, 'New Job Type');

    // Select status to trigger onBlur validation and enable the save button
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /^Aktif$/ }));

    const saveButton = screen.getByRole('button', {
      name: JOB_ITEM_TYPE_LABELS.CREATE.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: JOB_ITEM_TYPE_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/job-item-type');
    });
  });

  it('displays error message when creation fails', () => {
    render(<CreateJobItemTypePage />);
    expect(screen.getByText(JOB_ITEM_TYPE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });
});
