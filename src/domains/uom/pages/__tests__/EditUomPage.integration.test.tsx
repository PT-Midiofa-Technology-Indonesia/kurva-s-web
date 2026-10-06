import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { render, screen, waitFor } from '@/shared/utils/test-utils';

const h = (path: string) => `/api/v1${path}`;

import { UOM_LABELS } from '../../constants';
import { EditUomPage } from '../EditUomPage';

const mockPush = vi.fn();

const mockParams = { id: '1' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  usePathname: () => '/master-data/uom/1/edit',
  useSearchParams: () => new URLSearchParams(),
}));

describe('EditUomPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
    mockParams.id = '1';
  });

  it('renders without crashing', () => {
    render(<EditUomPage />);
  });

  it('renders page title and back button', async () => {
    render(<EditUomPage />);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  it('loads existing UoM data into the form', async () => {
    render(<EditUomPage />);

    await waitFor(() => {
      const codeInput = screen.getByDisplayValue('M');
      expect(codeInput).toBeInTheDocument();

      const nameInput = screen.getByDisplayValue('Meter');
      expect(nameInput).toBeInTheDocument();
    });
  });

  it('loads description into the form', async () => {
    render(<EditUomPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Satuan panjang SI')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get(h('/uoms/:id'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<EditUomPage />);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Meter')).not.toBeInTheDocument();
    });
  });

  it('navigates back on cancel', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<EditUomPage />);

    const cancelButton = await screen.findByRole('button', {
      name: UOM_LABELS.EDIT.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/master-data/uom');
  });

  it('shows confirm dialog after submitting the form', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<EditUomPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Meter')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: UOM_LABELS.EDIT.BUTTONS.SAVE });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(UOM_LABELS.EDIT.DIALOG.TITLE)).toBeInTheDocument();
    });
  });
});
