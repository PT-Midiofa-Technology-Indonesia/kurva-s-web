import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render, screen, waitFor } from '../../../../shared/utils/test-utils';
import { MANPOWER_LABELS } from '../../constants';
import { ManpowerListPage } from '../ManpowerListPage';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/human-resource/manpower',
  useSearchParams: () => mockSearchParams,
}));

describe('ManpowerListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders the employee list', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('renders employee with all visible fields', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('renders project worker employee', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Worker')).toBeInTheDocument();
    });
  });

  it('renders all column headers', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText('Nama Lengkap')).toBeInTheDocument();
      expect(screen.getByText('Jenis Kelamin')).toBeInTheDocument();
      expect(screen.getByText('Tipe Karyawan')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('navigates to create page when Add button is clicked', async () => {
    mockSearchParams = new URLSearchParams();
    const user = userEvent.setup();
    render(<ManpowerListPage />);

    const addButton = await screen.findByRole('button', { name: MANPOWER_LABELS.LIST.ADD_BUTTON });
    await user.click(addButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/human-resource/manpower/create')
    );
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('companyId=1'));
  });

  it('renders filters section', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /tipe karyawan/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
    });
  });

  it('renders page title', async () => {
    mockSearchParams = new URLSearchParams();
    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText('Manpower')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    mockSearchParams = new URLSearchParams();
    server.use(
      http.get(getApiPath('/employees'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    render(<ManpowerListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
