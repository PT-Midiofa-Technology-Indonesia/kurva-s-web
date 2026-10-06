import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { COMPANY_LABELS } from '../../constants';
import { DetailCompanyPage } from '../DetailCompanyPage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('DetailCompanyPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<DetailCompanyPage />);
  });

  it('displays page title', async () => {
    render(<DetailCompanyPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        COMPANY_LABELS.DETAIL.PAGE_TITLE
      );
    });
  });

  it('displays company info card', async () => {
    render(<DetailCompanyPage />);
    await waitFor(() => {
      expect(screen.getByText(COMPANY_LABELS.DETAIL.INFO_CARD_TITLE)).toBeInTheDocument();
    });
  });

  it('displays departments section', async () => {
    render(<DetailCompanyPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: COMPANY_LABELS.DETAIL.DEPARTMENT_CARD_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays delete button', async () => {
    render(<DetailCompanyPage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: COMPANY_LABELS.DETAIL.DELETE_BUTTON })
      ).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailCompanyPage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailCompanyPage />);

    const editButton = await screen.findByRole('button', {
      name: COMPANY_LABELS.DETAIL.EDIT_BUTTON,
    });
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/company/1/edit');
  });

  it('displays not found state when API fails', async () => {
    server.use(
      http.get(getApiPath('/companies/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      })
    );

    render(<DetailCompanyPage />);

    await waitFor(() => {
      expect(screen.getByText(/Company tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
