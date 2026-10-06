import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { USER_LABELS } from '../../constants';
import { EditUserPage } from '../EditUserPage';

// Mock navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ userId: '1' }),
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/user-management/1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

describe('EditUserPage Integration', () => {
  it('renders without crashing and fetches user data', async () => {
    render(<EditUserPage />);

    // Wait for the form to be rendered with user data
    await waitFor(() => {
      expect(screen.getByText(USER_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Item Detail')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();

    // Mock successful update
    server.use(
      http.put(getApiPath('/users/1'), () => {
        return HttpResponse.json({ success: true, message: 'User updated successfully' });
      })
    );

    render(<EditUserPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Item Detail')).toBeInTheDocument();
    });

    // Change the name
    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    // Click save
    const saveButton = screen.getByRole('button', { name: USER_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog should appear
    const confirmButton = await screen.findByRole('button', {
      name: USER_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user-management/user');
    });
  });

  it('displays error message when fetching user fails', async () => {
    server.use(
      http.get(getApiPath('/users/1'), () => {
        return HttpResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
      })
    );

    render(<EditUserPage />);

    await waitFor(() => {
      expect(screen.getByText(/User tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/users/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditUserPage />);

    // Wait for data to load
    const nameInput = await screen.findByDisplayValue('Test Item Detail');
    expect(nameInput).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: USER_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: USER_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
