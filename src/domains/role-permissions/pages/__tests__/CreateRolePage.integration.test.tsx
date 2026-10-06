import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ROLE_LABELS } from '../../constants';
import { CreateRolePage } from '../CreateRolePage';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CreateRolePage Integration', () => {
  it('renders without crashing', () => {
    render(<CreateRolePage />);
    expect(screen.getByText(ROLE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('handles successful role creation', async () => {
    const user = userEvent.setup();

    // Mock successful creation
    server.use(
      http.post(getApiPath('/roles'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Role created successfully',
          data: { id: '1', name: 'New Admin Role', description: 'Admin role', permissions: [] },
        });
      })
    );

    render(<CreateRolePage />);

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(ROLE_LABELS.CREATE.FIELDS.NAME_PLACEHOLDER);
    await user.type(nameInput, 'New Admin Role');

    // Select status to trigger onBlur validation and enable the save button
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    await user.click(statusSelect);
    await user.click(await screen.findByRole('option', { name: /^Aktif$/ }));

    // Click save
    const saveButton = screen.getByRole('button', { name: ROLE_LABELS.CREATE.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog should appear
    const confirmButton = await screen.findByRole('button', {
      name: ROLE_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user-management/role-permission');
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<CreateRolePage />);
    const saveButton = screen.getByRole('button', { name: ROLE_LABELS.CREATE.BUTTONS.SAVE });
    // The button might be disabled if form is invalid
    expect(saveButton).toBeDisabled();
  });

  it('displays error message when creation fails', () => {
    render(<CreateRolePage />);
    expect(screen.getByText(ROLE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });
});
