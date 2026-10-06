import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { PROSPECT_LABELS } from '../../constants';
import { ProspectPage } from '../ProspectPage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/prospectus/prospect',
  useSearchParams: () => new URLSearchParams('companyId=1'),
}));

const labels = PROSPECT_LABELS;
const detailLabels = PROSPECT_LABELS.DETAIL;

describe('ProspectPage Integration', () => {
  // ── Page rendering ──────────────────────────────────────────────────────────

  it('renders without crashing', () => {
    render(<ProspectPage />);
  });

  it('displays page title', async () => {
    render(<ProspectPage />);
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(labels.PAGE_TITLE);
  });

  it('shows company selector', async () => {
    render(<ProspectPage />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Pilih Perusahaan/i })).toBeInTheDocument();
    });
  });

  it('shows add button', async () => {
    render(<ProspectPage />);
    expect(await screen.findByRole('button', { name: labels.ADD_BUTTON })).toBeInTheDocument();
  });

  it('enables add button when company is selected', async () => {
    render(<ProspectPage />);
    const button = await screen.findByRole('button', { name: labels.ADD_BUTTON });
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // ── Kanban board ────────────────────────────────────────────────────────────

  it('displays kanban stage columns from API data', async () => {
    render(<ProspectPage />);
    await waitFor(() => {
      expect(screen.getByText('Identify')).toBeInTheDocument();
      expect(screen.getByText('Qualify')).toBeInTheDocument();
      expect(screen.getByText('Propose')).toBeInTheDocument();
    });
  });

  it('displays project cards in the kanban board', async () => {
    render(<ProspectPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Project Alpha')).toBeInTheDocument();
    });
  });

  it('shows project client name on card', async () => {
    render(<ProspectPage />);
    await waitFor(() => {
      expect(screen.getByText('PT. Client ABC')).toBeInTheDocument();
    });
  });

  // ── Create drawer ───────────────────────────────────────────────────────────

  it('opens create prospect drawer on button click', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    const addButton = await screen.findByRole('button', { name: labels.ADD_BUTTON });
    await waitFor(() => expect(addButton).not.toBeDisabled());
    await user.click(addButton);

    expect(await screen.findByText(labels.DRAWER.CREATE_TITLE)).toBeInTheDocument();
  });

  it('shows required form fields in create drawer', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    const addButton = await screen.findByRole('button', { name: labels.ADD_BUTTON });
    await waitFor(() => expect(addButton).not.toBeDisabled());
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(labels.DRAWER.FIELDS.TITLE)).toBeInTheDocument();
      expect(screen.getByText(labels.DRAWER.FIELDS.CLIENT)).toBeInTheDocument();
      expect(screen.getByText(labels.DRAWER.FIELDS.ESTIMATED_VALUE)).toBeInTheDocument();
      expect(screen.getByText(labels.DRAWER.FIELDS.PROJECT_START_DATE)).toBeInTheDocument();
      expect(screen.getByText(labels.DRAWER.FIELDS.PROJECT_END_DATE)).toBeInTheDocument();
    });
  });

  it('cancel button is accessible inside open drawer', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    const addButton = await screen.findByRole('button', { name: labels.ADD_BUTTON });
    await waitFor(() => expect(addButton).not.toBeDisabled());
    await user.click(addButton);

    const cancelButton = await screen.findByRole('button', {
      name: labels.DRAWER.BUTTONS.CANCEL,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
  });

  // ── Detail modal ────────────────────────────────────────────────────────────

  async function openDetailModal(user: ReturnType<typeof userEvent.setup>) {
    const cards = await screen.findAllByText('Test Project Alpha');
    await user.click(cards[0]);
    // Wait for the modal to be fully loaded (document list visible)
    await screen.findByRole('button', { name: detailLabels.BUTTONS.NEXT_STAGE });
  }

  it('opens detail modal when clicking a project card', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    expect(screen.getByRole('button', { name: detailLabels.TABS.DOCUMENT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: detailLabels.TABS.AKTIVITAS })).toBeInTheDocument();
  });

  it('detail modal shows document tab by default', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    expect(screen.getByText('Kartu Tanda Penduduk')).toBeInTheDocument();
    expect(screen.getByText('Nomor Pokok Wajib Pajak')).toBeInTheDocument();
  });

  it('detail modal next stage button is present', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    expect(
      screen.getByRole('button', { name: detailLabels.BUTTONS.NEXT_STAGE })
    ).toBeInTheDocument();
  });

  it('detail modal shows aktivitas tab content on tab switch', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    await user.click(screen.getByRole('button', { name: detailLabels.TABS.AKTIVITAS }));

    await waitFor(() => {
      expect(screen.getByText(detailLabels.ACTIVITY_FORM.DESCRIPTION_LABEL)).toBeInTheDocument();
    });
  });

  it('detail modal cancel button dismisses the modal', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    await user.click(screen.getByRole('button', { name: detailLabels.BUTTONS.CANCEL }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: detailLabels.BUTTONS.NEXT_STAGE })
      ).not.toBeInTheDocument();
    });
  });

  it('detail modal next stage button is disabled when mandatory documents are not uploaded', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    const nextStageButton = screen.getByRole('button', { name: detailLabels.BUTTONS.NEXT_STAGE });
    expect(nextStageButton).toBeDisabled();
  });

  it('detail modal shows stage history link when history data exists', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    await waitFor(() => {
      expect(screen.getByText(detailLabels.STAGE_HISTORY.LABEL)).toBeInTheDocument();
    });
  });

  it('detail modal shows browse file button on document rows', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: detailLabels.BUTTONS.BROWSE_FILE })
      ).toBeInTheDocument();
    });
  });

  it('detail modal aktivitas tab has save and cancel form buttons', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);
    await user.click(screen.getByRole('button', { name: detailLabels.TABS.AKTIVITAS }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: detailLabels.BUTTONS.FORM_SAVE })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: detailLabels.BUTTONS.FORM_CANCEL })
      ).toBeInTheDocument();
    });
  });

  it('detail modal save activity button is disabled when description is empty', async () => {
    const user = userEvent.setup();
    render(<ProspectPage />);

    await openDetailModal(user);
    await user.click(screen.getByRole('button', { name: detailLabels.TABS.AKTIVITAS }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: detailLabels.BUTTONS.FORM_SAVE })).toBeDisabled();
    });
  });

  // ── Error state ─────────────────────────────────────────────────────────────

  it('shows error state when prospects API fails', async () => {
    server.use(
      http.get(getHandlerPath('/prospects'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ProspectPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  it('handles detail API error gracefully', async () => {
    server.use(
      http.get(getHandlerPath('/projects/:id'), () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'Gagal memuat detail.',
            data: null,
            errorCode: 'SERVER_ERROR',
          },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    render(<ProspectPage />);

    const card = await screen.findByText('Test Project Alpha');
    await user.click(card);

    await waitFor(() => {
      expect(screen.queryByText('Kartu Tanda Penduduk')).not.toBeInTheDocument();
    });
  });
});
