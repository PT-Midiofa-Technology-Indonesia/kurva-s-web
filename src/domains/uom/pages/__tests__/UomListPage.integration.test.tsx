import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { UOM_LABELS } from '../../constants';
import { UomListPage } from '../UomListPage';

const h = (path: string) => `/api/v1${path}`;

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/uom',
  useSearchParams: () => new URLSearchParams(),
}));

describe('UomListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders page title', async () => {
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.LIST.TITLE)).toBeInTheDocument();
    });
  });

  it('renders column headers', async () => {
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.LIST.COLUMNS.CODE)).toBeInTheDocument();
      expect(screen.getByText(UOM_LABELS.LIST.COLUMNS.NAME)).toBeInTheDocument();
      expect(screen.getByText(UOM_LABELS.LIST.COLUMNS.GROUP)).toBeInTheDocument();
    });
  });

  it('fetches and displays UoM data', async () => {
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText('Meter')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('Kilogram')).toBeInTheDocument();
      expect(screen.getByText('KG')).toBeInTheDocument();
    });
  });

  it('renders active/inactive status badges', async () => {
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.LIST.STATUS.ACTIVE)).toBeInTheDocument();
      expect(screen.getByText(UOM_LABELS.LIST.STATUS.INACTIVE)).toBeInTheDocument();
    });
  });

  it('navigates to create page when Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<UomListPage />);

    const addButton = await screen.findByRole('button', { name: UOM_LABELS.LIST.ADD_BUTTON });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/uom/create');
  });

  it('opens delete confirm dialog then cancels', async () => {
    const user = userEvent.setup();
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText('Meter')).toBeInTheDocument();
    });

    const ellipsisButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-ellipsis-vertical'));
    await user.click(ellipsisButtons[0]);

    const deleteMenuItem = await screen.findByText(UOM_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    expect(await screen.findByText(UOM_LABELS.DIALOG.DELETE_TITLE)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(UOM_LABELS.DIALOG.DELETE_TITLE)).not.toBeInTheDocument();
    });
  });

  it('handles deletion flow', async () => {
    const user = userEvent.setup();
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText('Meter')).toBeInTheDocument();
    });

    const ellipsisButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-ellipsis-vertical'));
    await user.click(ellipsisButtons[0]);

    const deleteMenuItem = await screen.findByText(UOM_LABELS.LIST.ACTIONS.DELETE);
    await user.click(deleteMenuItem);

    await screen.findByText(UOM_LABELS.DIALOG.DELETE_TITLE);

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(UOM_LABELS.DIALOG.DELETE_TITLE)).not.toBeInTheDocument();
    });
  });

  it('opens detail drawer on View action', async () => {
    const user = userEvent.setup();
    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText('Meter')).toBeInTheDocument();
    });

    const ellipsisButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-ellipsis-vertical'));
    await user.click(ellipsisButtons[0]);

    const viewMenuItem = await screen.findByText(UOM_LABELS.LIST.ACTIONS.DETAIL);
    await user.click(viewMenuItem);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(UOM_LABELS.DETAIL.PAGE_TITLE)).toBeInTheDocument();
  });

  it('navigates to edit page from detail drawer', async () => {
    const user = userEvent.setup();
    render(<UomListPage />);

    const meterCell = await screen.findByText('Meter');
    const meterRow = meterCell.closest('tr')!;
    const ellipsisButton = within(meterRow)
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg.lucide-ellipsis-vertical'))!;
    await user.click(ellipsisButton);

    await user.click(await screen.findByText(UOM_LABELS.LIST.ACTIONS.DETAIL));

    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: UOM_LABELS.DETAIL.BUTTONS.EDIT }));

    expect(mockPush).toHaveBeenCalledWith('/master-data/uom/1/edit');
  });

  it('displays empty state message when list is empty', async () => {
    server.use(
      http.get(h('/uoms'), () => {
        return HttpResponse.json({
          success: true,
          message: UOM_LABELS.LIST.EMPTY,
          data: [],
          meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 1, from: null, to: null },
          links: { first: null, last: null, prev: null, next: null },
        });
      })
    );

    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.LIST.EMPTY)).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get(h('/uoms'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<UomListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
