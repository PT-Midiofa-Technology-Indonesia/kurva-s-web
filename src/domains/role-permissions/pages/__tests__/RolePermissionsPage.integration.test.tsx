import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { ROLE_LABELS } from '../../constants';
import { RolePermissionsPage } from '../RolePermissionsPage';

const mockPush = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/user-management/role-permission',
  useSearchParams: () => mockUseSearchParams(),
}));

describe('RolePermissionsPage Integration', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseSearchParams.mockReset();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('renders without crashing', async () => {
    render(<RolePermissionsPage />);

    expect(await screen.findByText(ROLE_LABELS.LIST.PAGE_TITLE)).toBeInTheDocument();

    // Wait for the generic mock data to appear
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  it('restores query params into table state and status filter on refresh', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('page=2&perPage=25&sortBy=name&sortOrder=desc&search=Admin&isActive=true')
    );

    render(<RolePermissionsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
    });

    expect(screen.getByRole('combobox', { name: /Status/i })).toHaveTextContent('Aktif');
  });

  it('handles role deletion', async () => {
    const user = userEvent.setup();

    // Mock successful deletion
    server.use(
      http.delete(getApiPath('/roles/:id'), () => {
        return HttpResponse.json({ success: true, message: 'Role deleted successfully' });
      })
    );

    render(<RolePermissionsPage />);

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    // Open actions menu
    const actionButtons = screen.getAllByRole('button');
    const ellipsisButton = actionButtons.find((btn) =>
      btn.querySelector('svg.lucide-ellipsis-vertical')
    );
    if (!ellipsisButton) throw new Error('Action button not found');
    await user.click(ellipsisButton);

    // Click delete
    const deleteButton = await screen.findByText(ROLE_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteButton);

    // Confirm dialog
    const confirmButton = await screen.findByRole('button', {
      name: ROLE_LABELS.DETAIL.DELETE_DIALOG.CONFIRM,
    });
    await user.click(confirmButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.queryByText(ROLE_LABELS.DETAIL.DELETE_DIALOG.TITLE)).not.toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/roles'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<RolePermissionsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
