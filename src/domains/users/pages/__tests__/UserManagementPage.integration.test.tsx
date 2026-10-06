import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { USER_LABELS } from '../../constants';
import { UserManagementPage } from '../UserManagementPage';

const mockPush = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/user-management/user',
  useSearchParams: () => mockUseSearchParams(),
}));

describe('UserManagementPage Integration', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseSearchParams.mockReset();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('renders without crashing', async () => {
    render(<UserManagementPage />);
    expect(await screen.findByText(USER_LABELS.LIST.PAGE_TITLE)).toBeInTheDocument();
  });

  it('fetches and displays the mock data', async () => {
    render(<UserManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<UserManagementPage />);

    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'John Doe');

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('updates user type query param after refresh-restored selection changes', async () => {
    const user = userEvent.setup();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('userType=non_employee'));

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: USER_LABELS.LIST.FILTERS.USER_TYPE })
      ).toHaveTextContent('Non Employee');
    });

    await user.click(screen.getByRole('combobox', { name: USER_LABELS.LIST.FILTERS.USER_TYPE }));
    await user.click(await screen.findByText('Employee'));

    await waitFor(() => {
      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/user-management/user?userType=employee');
    });

    pushStateSpy.mockRestore();
  });

  it('restores query params into table state and filters on refresh', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'page=3&perPage=25&sortBy=email&sortOrder=desc&search=jane&roleId=1&userType=employee'
      )
    );

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('jane')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: USER_LABELS.LIST.FILTERS.ROLE })
      ).toHaveTextContent('Admin');
    });
    expect(
      screen.getByRole('combobox', { name: USER_LABELS.LIST.FILTERS.USER_TYPE })
    ).toHaveTextContent('Employee');
  });

  it('handles deleting a user', async () => {
    const user = userEvent.setup();

    // Mock successful deletion
    server.use(
      http.delete(getApiPath('/users/1'), () => {
        return HttpResponse.json({ success: true, message: 'User deleted successfully' });
      })
    );

    render(<UserManagementPage />);

    // Find the action button (EllipsisVertical)
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button');
    // The action button is inside the table row. ListPageTemplate might have multiple buttons.
    // Based on the code, it's a Button with EllipsisVertical.
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );

    if (!ellipsisButton) throw new Error('Action button not found');

    await user.click(ellipsisButton);

    // Click delete in dropdown
    const deleteMenuItem = await screen.findByText(USER_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    // Confirm dialog should appear
    expect(screen.getByText(USER_LABELS.DETAIL.DELETE_DIALOG.TITLE)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', {
      name: USER_LABELS.DETAIL.DELETE_DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for the dialog to close or success message
    await waitFor(() => {
      expect(screen.queryByText(USER_LABELS.DETAIL.DELETE_DIALOG.TITLE)).not.toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/users'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
