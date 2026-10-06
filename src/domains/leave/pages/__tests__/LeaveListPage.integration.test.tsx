import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/utils/test-utils';
import { LEAVE_LABELS } from '../../constants';
import { LeaveListPage } from '../LeaveListPage';

const routerPushMock = vi.fn();
const pushStateMock = vi.spyOn(window.history, 'pushState');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPushMock }),
  usePathname: () => '/human-resource/leave',
  useSearchParams: () => new URLSearchParams('companyId=company-1'),
  useParams: () => ({}),
}));

describe('LeaveListPage Integration', () => {
  beforeEach(() => {
    routerPushMock.mockClear();
    pushStateMock.mockClear();
  });

  it('renders page title and primary actions', async () => {
    render(<LeaveListPage />);

    await waitFor(() => {
      expect(screen.getByText(LEAVE_LABELS.LIST.TITLE)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: LEAVE_LABELS.BUTTONS.SETTING })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: LEAVE_LABELS.LIST.ADD_BUTTON })
      ).toBeInTheDocument();
    });
  });

  it('shows leave rows from the API-backed mock', async () => {
    render(<LeaveListPage />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Cuti Tahunan')).toBeInTheDocument();
      expect(screen.getByText('Pulang kampung')).toBeInTheDocument();
    });
  });

  it('updates the URL search param when searching leaves', async () => {
    const user = userEvent.setup();
    render(<LeaveListPage />);

    const searchInput = screen.getByPlaceholderText(LEAVE_LABELS.LIST.SEARCH);
    await user.type(searchInput, 'LV/EMP-002');

    await waitFor(() => {
      expect(pushStateMock).toHaveBeenCalled();
    });

    const lastCall = pushStateMock.mock.calls[pushStateMock.mock.calls.length - 1] ?? [];
    const url = lastCall[2] as string;
    expect(url).toContain('/human-resource/leave?');

    const parsedUrl = new URL(url, 'http://localhost');
    expect(parsedUrl.searchParams.get('companyId')).toBe('company-1');
    expect(parsedUrl.searchParams.get('search')).toBe('LV/EMP-002');
    expect(parsedUrl.searchParams.get('page')).toBe('1');
  });

  it('opens leave detail drawer when employee name is clicked', async () => {
    const user = userEvent.setup();
    render(<LeaveListPage />);

    await user.click(await screen.findByRole('button', { name: 'Budi Santoso' }));

    await waitFor(() => {
      expect(screen.getByText(LEAVE_LABELS.DETAIL.TITLE)).toBeInTheDocument();
      expect(screen.getAllByText('Pulang kampung')).toHaveLength(2);
    });
  });

  it('opens filter drawer from toolbar', async () => {
    const user = userEvent.setup();
    render(<LeaveListPage />);

    await user.click(await screen.findByRole('button', { name: LEAVE_LABELS.LIST.FILTERS.FILTER }));

    await waitFor(() => {
      expect(screen.getByText(LEAVE_LABELS.LIST.FILTERS.STATUS)).toBeInTheDocument();
    });
  });

  it('shows loading state while list query is pending', () => {
    server.use(
      http.get(getApiPath('/human-resource/leaves'), async () => {
        await new Promise(() => {});
      })
    );

    render(<LeaveListPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows an error state when the leave API returns an error', async () => {
    server.use(
      http.get(getApiPath('/human-resource/leaves'), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Internal Server Error',
            data: null,
            errorCode: 'SERVER_ERROR',
          },
          { status: 500 }
        );
      })
    );

    render(<LeaveListPage />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});
