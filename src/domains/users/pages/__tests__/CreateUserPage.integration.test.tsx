import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { toast } from '@/shared/lib/toast';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PLACEHOLDERS, USER_LABELS } from '../../constants';
import { CreateUserPage } from '../CreateUserPage';

// Mock navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => '/user-management/create',
  useSearchParams: () => new URLSearchParams(),
}));

describe('CreateUserPage Integration', () => {
  it('renders without crashing', () => {
    render(<CreateUserPage />);
    expect(screen.getByText(USER_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it.skip('handles successful user creation', async () => {
    const user = userEvent.setup();

    // Mock successful creation
    server.use(
      http.post(getApiPath('/users'), () => {
        return HttpResponse.json({ success: true, message: 'User created successfully' });
      })
    );

    render(<CreateUserPage />);

    // Select User Type FIRST (Select component)
    const userTypeSelect = await screen.findByRole('combobox', {
      name: new RegExp(USER_LABELS.CREATE.FIELDS.USER_TYPE, 'i'),
    });
    await user.click(userTypeSelect);
    const nonEmployeeOption = await screen.findByRole('option', { name: /Non Employee/i });
    await user.click(nonEmployeeOption);

    // Fill in the form
    await user.type(
      await screen.findByRole('textbox', { name: new RegExp(USER_LABELS.CREATE.FIELDS.NAME, 'i') }),
      'John Doe'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: new RegExp(USER_LABELS.CREATE.FIELDS.EMAIL, 'i'),
      }),
      'john@example.com'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: new RegExp(USER_LABELS.CREATE.FIELDS.PHONE_NUMBER, 'i'),
      }),
      '+628123456789'
    );
    await user.type(await screen.findByPlaceholderText(PLACEHOLDERS.PASSWORD), 'password123');

    // Select Role
    await user.click(
      await screen.findByRole('combobox', { name: new RegExp(USER_LABELS.CREATE.FIELDS.ROLE, 'i') })
    );
    await user.click(await screen.findByText(/^Admin$/));

    // Select Status (value: '1' = Active)
    const statusCombobox = await screen.findByRole('combobox', {
      name: new RegExp(USER_LABELS.CREATE.FIELDS.STATUS, 'i'),
    });
    await user.click(statusCombobox);
    // Use findByText since findByRole with name matching can fail when options use value not label
    await user.click(await screen.findByText(/^Aktif$/));

    // Click save
    const saveButton = screen.getByRole('button', { name: USER_LABELS.CREATE.BUTTONS.SAVE });
    await user.click(saveButton);

    // Confirm dialog should appear
    const confirmButton = await screen.findByRole('button', {
      name: USER_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success/navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/user-management/user');
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<CreateUserPage />);

    const saveButton = screen.getByRole('button', { name: USER_LABELS.CREATE.BUTTONS.SAVE });
    expect(saveButton).toBeDisabled();
  });

  it.skip('displays error message when creation fails', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(getApiPath('/users'), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Email already exists',
            data: null,
            errorCode: 'EMAIL_EXISTS',
          },
          { status: 400 }
        );
      })
    );

    render(<CreateUserPage />);

    // Select User Type
    const userTypeSelect = await screen.findByRole('combobox', {
      name: new RegExp(USER_LABELS.CREATE.FIELDS.USER_TYPE, 'i'),
    });
    await user.click(userTypeSelect);
    const nonEmployeeOption = await screen.findByRole('option', { name: /Non Employee/i });
    await user.click(nonEmployeeOption);

    // Fill in the form
    await user.type(
      await screen.findByRole('textbox', { name: new RegExp(USER_LABELS.CREATE.FIELDS.NAME, 'i') }),
      'John Doe'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: new RegExp(USER_LABELS.CREATE.FIELDS.EMAIL, 'i'),
      }),
      'existing@example.com'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: new RegExp(USER_LABELS.CREATE.FIELDS.PHONE_NUMBER, 'i'),
      }),
      '+628123456789'
    );
    await user.type(await screen.findByPlaceholderText(PLACEHOLDERS.PASSWORD), 'password123');

    // Select Role
    await user.click(
      await screen.findByRole('combobox', { name: new RegExp(USER_LABELS.CREATE.FIELDS.ROLE, 'i') })
    );
    await user.click(await screen.findByText(/^Admin$/));

    // Select Status (value: '1' = Active)
    const statusCombobox = await screen.findByRole('combobox', {
      name: new RegExp(USER_LABELS.CREATE.FIELDS.STATUS, 'i'),
    });
    await user.click(statusCombobox);
    await user.click(await screen.findByText(/^Aktif$/));

    // Click save
    const saveButton = screen.getByRole('button', { name: USER_LABELS.CREATE.BUTTONS.SAVE });
    await user.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: USER_LABELS.CREATE.DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });
});
