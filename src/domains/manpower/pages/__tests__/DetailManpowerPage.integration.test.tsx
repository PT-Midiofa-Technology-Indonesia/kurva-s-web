import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { MANPOWER_LABELS } from '../../constants';
import { DetailManpowerPage } from '../DetailManpowerPage';

const mockPush = vi.fn();

const mockParamsRef = { value: { id: '1' } };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/manpower/1',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => mockParamsRef.value,
}));

describe('DetailManpowerPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockParamsRef.value = { id: '1' };
  });

  it('renders the detail page with employee info', async () => {
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('Detail Manpower')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('renders employee detail info card', async () => {
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('Informasi Manpower')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('renders position assignments card', async () => {
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: MANPOWER_LABELS.DETAIL.POSITION_CARD_TITLE,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: MANPOWER_LABELS.DETAIL.POSITION_CARD_TITLE,
        })
      ).toBeInTheDocument();
      expect(screen.getByText('PT. Curva 1')).toBeInTheDocument();
    });
  });

  it('renders manpower settings tabs', async () => {
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Ringkasan Rating/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: MANPOWER_LABELS.DETAIL.POSITION_CARD_TITLE })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pengaturan Skill' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pengaturan Work Place' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: MANPOWER_LABELS.DETAIL.OTHER_SETTINGS_CARD_TITLE })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: MANPOWER_LABELS.DETAIL.RATING.TITLE })
    ).toBeInTheDocument();
  });

  it('opens rating history content when the rating tab is selected', async () => {
    const user = userEvent.setup();
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: MANPOWER_LABELS.DETAIL.RATING.TITLE }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Riwayat Rating/i })).toBeInTheDocument();
    });
  });

  it('opens other settings content when the tab is selected', async () => {
    const user = userEvent.setup();
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: MANPOWER_LABELS.DETAIL.OTHER_SETTINGS_CARD_TITLE })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: MANPOWER_LABELS.DETAIL.OTHER_SETTINGS_CARD_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/human-resource/manpower');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: new RegExp(MANPOWER_LABELS.DETAIL.BUTTONS.EDIT, 'i'),
    });
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/human-resource/manpower/1/edit');
  });

  it('opens delete dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {
      name: new RegExp(MANPOWER_LABELS.DETAIL.BUTTONS.DELETE, 'i'),
    });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(MANPOWER_LABELS.DETAIL.DIALOG.DELETE_TITLE)).toBeInTheDocument();
    });
  });

  it('shows not found message when employee does not exist', async () => {
    server.use(
      http.get(getApiPath('/employees/999'), () => {
        return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      })
    );

    mockParamsRef.value = { id: '999' };
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText(MANPOWER_LABELS.DETAIL.NOT_FOUND)).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<DetailManpowerPage />);

    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders position assignments table with correct columns', async () => {
    render(<DetailManpowerPage />);

    await waitFor(() => {
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Job Position')).toBeInTheDocument();
    });
  });
});
