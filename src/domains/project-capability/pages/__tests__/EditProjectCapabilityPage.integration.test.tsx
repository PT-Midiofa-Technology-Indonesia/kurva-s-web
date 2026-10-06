import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PROJECT_CAPABILITY_LABELS } from '../../constants';
import { EditProjectCapabilityPage } from '../EditProjectCapabilityPage';

// Mock navigation
const mockPush = vi.fn();
const mockParams = { id: '1' };
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

describe('EditProjectCapabilityPage Integration', () => {
  it('renders without crashing and fetches data', async () => {
    render(<EditProjectCapabilityPage />);

    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByText(PROJECT_CAPABILITY_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    render(<EditProjectCapabilityPage />);

    // Wait for data
    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Capability');

    // Click save
    const saveButton = screen.getByRole('button', {
      name: PROJECT_CAPABILITY_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    // Confirm dialog
    const confirmButton = await screen.findByRole('button', {
      name: PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/master-data/project-capability');
    });
  });

  it('displays error message when fetching fails', async () => {
    server.use(
      http.get(getApiPath('/project-capabilities/1'), () => {
        return HttpResponse.json(
          { message: 'Project capability tidak ditemukan' },
          { status: 404 }
        );
      })
    );

    render(<EditProjectCapabilityPage />);

    await waitFor(() => {
      expect(screen.getByText(/Project capability tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/project-capabilities/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditProjectCapabilityPage />);

    await screen.findByDisplayValue('Test Item Detail');
    const saveButton = screen.getByRole('button', {
      name: PROJECT_CAPABILITY_LABELS.EDIT.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: PROJECT_CAPABILITY_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
