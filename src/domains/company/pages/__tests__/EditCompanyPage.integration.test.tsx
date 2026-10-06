import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS } from '../../constants';
import { EditCompanyPage } from '../EditCompanyPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('EditCompanyPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<EditCompanyPage />);
  });

  it('renders page title after loading', async () => {
    render(<EditCompanyPage />);
    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('renders back button after loading', async () => {
    render(<EditCompanyPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  it('renders form fields after loading', async () => {
    render(<EditCompanyPage />);
    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(COMPANY_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons after loading', async () => {
    render(<EditCompanyPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.EDIT.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditCompanyPage />);

    const cancelButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.EDIT.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditCompanyPage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company');
  });

  it('displays not found state when API fails', async () => {
    server.use(
      http.get(getApiPath('/companies/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      })
    );

    render(<EditCompanyPage />);

    await waitFor(() => {
      expect(screen.getByText(/Company tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
