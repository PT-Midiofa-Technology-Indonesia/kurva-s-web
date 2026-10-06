import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';

import { APPROVAL_WORKFLOW_LABELS } from '../../constants';
import { ApprovalWorkflowListPage } from '../ApprovalWorkflowListPage';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams('companyId=1');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/approval-management/approval-workflow',
  useSearchParams: () => mockSearchParams,
}));

describe('ApprovalWorkflowListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockSearchParams.forEach((_, k) => {
      mockSearchParams.delete(k);
    });
    mockSearchParams.set('companyId', '1');
  });

  it('renders without crashing', () => {
    render(<ApprovalWorkflowListPage />);
  });

  it('displays page title', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: APPROVAL_WORKFLOW_LABELS.LIST.TITLE })
      ).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(APPROVAL_WORKFLOW_LABELS.LIST.SEARCH_PLACEHOLDER)
      ).toBeInTheDocument();
    });
  });

  it('shows company select dropdown in header', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders table column headers', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      // NAME column header ('Approval Workflow') matches the page title, so use getAllByText
      expect(
        screen.getAllByText(APPROVAL_WORKFLOW_LABELS.LIST.COLUMNS.NAME).length
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(APPROVAL_WORKFLOW_LABELS.LIST.COLUMNS.STEPS_COUNT)
      ).toBeInTheDocument();
    });
  });

  it('fetches and displays mock workflow after company is auto-selected', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      expect(screen.getByText('Penambahan Karyawan Baru')).toBeInTheDocument();
    });
  });

  it('displays step count badge for each row', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      // stepsCount is 2 in mock data
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('shows "Pengaturan" action button for each row', async () => {
    render(<ApprovalWorkflowListPage />);
    await waitFor(() => {
      expect(screen.getByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS)).toBeInTheDocument();
    });
  });

  it('opens settings drawer when "Pengaturan" is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText(APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.TITLE)).toBeInTheDocument();
    });
  });

  it('shows workflow name inside the settings drawer', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      // Workflow name appears in drawer header panel
      expect(screen.getAllByText('Penambahan Karyawan Baru').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('closes settings drawer when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText(APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.TITLE)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', {
      name: APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    await waitFor(() => {
      const drawerContent = document.querySelector('[data-slot="drawer-content"]');
      expect(drawerContent?.getAttribute('data-state')).toBe('closed');
    });
  });

  it('shows step rows loaded from detail API inside the drawer', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(
        screen.getByText(`${APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.STEP_LABEL} 1`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.STEP_LABEL} 2`)
      ).toBeInTheDocument();
    });
  });

  it('shows "Tambah Step" button inside the drawer', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.BUTTONS.ADD_STEP,
        })
      ).toBeInTheDocument();
    });
  });

  it('shows "Simpan Perubahan" submit button inside the drawer', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.BUTTONS.SAVE,
        })
      ).toBeInTheDocument();
    });
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const searchInput = await screen.findByPlaceholderText(
      APPROVAL_WORKFLOW_LABELS.LIST.SEARCH_PLACEHOLDER
    );
    await user.type(searchInput, 'Karyawan');

    await waitFor(() => {
      expect(searchInput).toHaveValue('Karyawan');
    });
  });

  it('displays error message when list API fails', async () => {
    server.use(
      http.get(getApiPath('/approval-workflows'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ApprovalWorkflowListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });

  it('loads and shows PIC options when step has approverType and approverId', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    await waitFor(() => {
      expect(
        screen.getByText(`${APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.STEP_LABEL} 1`)
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('saves workflow settings and closes drawer on success', async () => {
    const user = userEvent.setup();
    render(<ApprovalWorkflowListPage />);

    const settingsButton = await screen.findByText(APPROVAL_WORKFLOW_LABELS.LIST.ACTIONS.SETTINGS);
    await user.click(settingsButton);

    // Wait for steps to load
    await waitFor(() => {
      expect(
        screen.getByText(`${APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.STEP_LABEL} 1`)
      ).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', {
      name: APPROVAL_WORKFLOW_LABELS.SETTINGS_DRAWER.BUTTONS.SAVE,
    });
    await user.click(saveButton);

    await waitFor(() => {
      const drawerContent = document.querySelector('[data-slot="drawer-content"]');
      expect(drawerContent?.getAttribute('data-state')).toBe('closed');
    });
  });
});
