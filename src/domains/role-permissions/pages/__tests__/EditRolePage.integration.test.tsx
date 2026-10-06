import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ROLE_LABELS } from '../../constants';
import { EditRolePage } from '../EditRolePage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ roleId: '1' }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('EditRolePage Integration', () => {
  it('renders without crashing and fetches role data', async () => {
    render(<EditRolePage />);

    expect(await screen.findByText(ROLE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/roles/1'), () => {
        return HttpResponse.json({ success: true, message: 'Updated successfully' });
      })
    );

    render(<EditRolePage />);

    // Wait for data to load
    const nameInput = await screen.findByDisplayValue('Admin');
    expect(nameInput).toBeInTheDocument();

    // Change status
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    const inactiveOption = await screen.findByText('Tidak Aktif');
    await user.click(inactiveOption);

    const saveButton = screen.getByRole('button', { name: ROLE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog should appear
    const confirmButton = await screen.findByRole('button', {
      name: ROLE_LABELS.EDIT.DIALOG.CONFIRM,
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

    render(<EditRolePage />);

    await waitFor(() => {
      expect(screen.getByText(/Role tidak ditemukan/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.put(getApiPath('/roles/1'), () => {
        return HttpResponse.json({ message: 'Update failed' }, { status: 400 });
      })
    );

    render(<EditRolePage />);

    // Wait for data to load
    const nameInput = await screen.findByDisplayValue('Admin');
    expect(nameInput).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: ROLE_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: ROLE_LABELS.EDIT.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });
});
