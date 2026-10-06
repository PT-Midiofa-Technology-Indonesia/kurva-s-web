import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { UOM_LABELS } from '../../constants';
import { CreateUomPage } from '../CreateUomPage';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/master-data/uom/create',
  useSearchParams: () => new URLSearchParams(),
}));

describe('CreateUomPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<CreateUomPage />);
  });

  it('renders page title and back button', async () => {
    render(<CreateUomPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  it('renders all form fields', async () => {
    render(<CreateUomPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Kode UoM/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama UoM/i)).toBeInTheDocument();
      expect(screen.getByText('Deskripsi')).toBeInTheDocument();
    });
  });

  it('navigates back on cancel', async () => {
    const user = userEvent.setup();
    render(<CreateUomPage />);

    const cancelButton = await screen.findByRole('button', {
      name: UOM_LABELS.CREATE.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/uom');
  });

  it('navigates back on back button click', async () => {
    const user = userEvent.setup();
    render(<CreateUomPage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/uom');
  });

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateUomPage />);

    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: UOM_LABELS.CREATE.BUTTONS.SAVE });
      expect(saveButton).toBeDisabled();
    });
  });
});
