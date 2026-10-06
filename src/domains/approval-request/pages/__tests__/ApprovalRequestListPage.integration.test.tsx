import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';

import { APPROVAL_REQUEST_LABELS } from '../../constants';
import { ApprovalRequestListPage } from '../ApprovalRequestListPage';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams('companyId=1');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/approval-management/approval-request',
  useSearchParams: () => mockSearchParams,
}));

describe('ApprovalRequestListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockSearchParams.forEach((_, k) => {
      mockSearchParams.delete(k);
    });
    mockSearchParams.set('companyId', '1');
  });

  it('renders without crashing', () => {
    render(<ApprovalRequestListPage />);
  });

  it('displays page title', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: APPROVAL_REQUEST_LABELS.LIST.TITLE })
      ).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(APPROVAL_REQUEST_LABELS.LIST.SEARCH_PLACEHOLDER)
      ).toBeInTheDocument();
    });
  });

  it('renders table column headers', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(screen.getByText(APPROVAL_REQUEST_LABELS.LIST.COLUMNS.CODE)).toBeInTheDocument();
      // WORKFLOW_NAME ('Approval Request') matches the page title h1, so use getAllByText
      expect(
        screen.getAllByText(APPROVAL_REQUEST_LABELS.LIST.COLUMNS.WORKFLOW_NAME).length
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(APPROVAL_REQUEST_LABELS.LIST.COLUMNS.STATUS)).toBeInTheDocument();
    });
  });

  it('fetches and displays mock data after company is selected', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(screen.getByText('AR001')).toBeInTheDocument();
      expect(screen.getByText('Penambahan Karyawan Baru')).toBeInTheDocument();
    });
  });

  it('shows "Lihat Pengajuan" action button for each row', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(screen.getByText(APPROVAL_REQUEST_LABELS.LIST.ACTIONS.VIEW)).toBeInTheDocument();
    });
  });

  it('navigates to detail page when "Lihat Pengajuan" is clicked', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestListPage />);

    const viewButton = await screen.findByText(APPROVAL_REQUEST_LABELS.LIST.ACTIONS.VIEW);
    await user.click(viewButton);

    expect(mockPush).toHaveBeenCalledWith('/approval-management/approval-request/ar-001');
  });

  it('handles search input typing', async () => {
    const user = userEvent.setup();
    render(<ApprovalRequestListPage />);

    const searchInput = await screen.findByPlaceholderText(
      APPROVAL_REQUEST_LABELS.LIST.SEARCH_PLACEHOLDER
    );
    await user.type(searchInput, 'AR');

    await waitFor(() => {
      expect(searchInput).toHaveValue('AR');
    });
  });

  it('shows status filter dropdown loaded from enum API', async () => {
    render(<ApprovalRequestListPage />);
    await waitFor(() => {
      expect(screen.getByText('AR001')).toBeInTheDocument();
    });
    const comboboxes = await screen.findAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('displays error message when list API fails', async () => {
    server.use(
      http.get(getApiPath('/approval-requests'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ApprovalRequestListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
