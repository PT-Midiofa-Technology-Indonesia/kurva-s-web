import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS } from '../../constants';
import { CreateCompanyPage } from '../CreateCompanyPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CreateCompanyPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateCompanyPage />);
  });

  it('renders page title', () => {
    render(<CreateCompanyPage />);
    expect(screen.getByText(COMPANY_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<CreateCompanyPage />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders form fields', async () => {
    render(<CreateCompanyPage />);
    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(COMPANY_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons', async () => {
    render(<CreateCompanyPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateCompanyPage />);
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: COMPANY_LABELS.CREATE.BUTTONS.SAVE });
      expect(saveButton).toBeDisabled();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateCompanyPage />);

    const cancelButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateCompanyPage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company');
  });

  it('displays confirm dialog configuration', () => {
    render(<CreateCompanyPage />);
    expect(COMPANY_LABELS.CREATE.DIALOG.TITLE).toBe('Simpan Company Baru?');
    expect(COMPANY_LABELS.CREATE.DIALOG.CONFIRM).toBe('Simpan');
  });
});
