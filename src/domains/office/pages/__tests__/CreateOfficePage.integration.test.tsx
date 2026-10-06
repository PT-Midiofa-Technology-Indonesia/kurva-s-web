import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { OFFICE_LABELS } from '../../constants';
import { CreateOfficePage } from '../CreateOfficePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CreateOfficePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateOfficePage />);
  });

  it('renders page title', () => {
    render(<CreateOfficePage />);
    expect(screen.getByText(OFFICE_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateOfficePage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateOfficePage />);
    await waitFor(() => {
      expect(screen.getByText(OFFICE_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(OFFICE_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
      expect(screen.getByText(OFFICE_LABELS.CREATE.FIELDS.TYPE)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateOfficePage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: OFFICE_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: OFFICE_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateOfficePage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: OFFICE_LABELS.CREATE.BUTTONS.SAVE });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateOfficePage />);

    const cancelButton = await screen.findByRole('button', {
      name: OFFICE_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/office');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateOfficePage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/office');
  });

  it('displays confirm dialog configuration', () => {
    render(<CreateOfficePage />);
    expect(OFFICE_LABELS.CREATE.DIALOG.TITLE).toBe('Simpan Office Baru?');
    expect(OFFICE_LABELS.CREATE.DIALOG.CONFIRM).toBe('Simpan');
  });
});
