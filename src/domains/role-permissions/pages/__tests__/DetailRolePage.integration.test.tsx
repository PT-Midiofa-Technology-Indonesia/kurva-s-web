import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ROLE_LABELS } from '../../constants';
import { DetailRolePage } from '../DetailRolePage';

// Mock navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ roleId: '1' }),
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

describe('DetailRolePage Integration', () => {
  it('renders without crashing and fetches role data', async () => {
    render(<DetailRolePage />);

    expect(await screen.findByText(ROLE_LABELS.DETAIL.PAGE_TITLE)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('handles navigation to edit page', async () => {
    const user = userEvent.setup();
    render(<DetailRolePage />);

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: ROLE_LABELS.DETAIL.BUTTONS.EDIT });
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/user-management/role-permission/1/edit');
  });

  it('handles role deletion', async () => {
    const user = userEvent.setup();

    // Mock successful deletion
    server.use(
      http.delete(getApiPath('/roles/1'), () => {
        return HttpResponse.json({ success: true, message: 'Role deleted successfully' });
      })
    );

    render(<DetailRolePage />);

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: ROLE_LABELS.DETAIL.BUTTONS.DELETE });
    await user.click(deleteButton);

    // Confirm dialog
    const confirmButton = await screen.findByRole('button', {
      name: ROLE_LABELS.DETAIL.DELETE_DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user-management/role-permission');
    });
  });

  it('displays error message when fetching role fails', async () => {
    server.use(
      http.get(getApiPath('/roles/1'), () => {
        return HttpResponse.json({ message: 'Role tidak ditemukan' }, { status: 404 });
      })
    );

    render(<DetailRolePage />);

    await waitFor(() => {
      expect(screen.getByText(/Item tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
