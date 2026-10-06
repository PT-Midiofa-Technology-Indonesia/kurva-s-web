import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { WAREHOUSE_LABELS } from '../../constants';
import { EditWarehousePage } from '../EditWarehousePage';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: mockPush }),
}));

describe('EditWarehousePage Integration', () => {
  afterEach(() => {
    mockPush.mockClear();
  });

  it('renders without crashing', () => {
    render(<EditWarehousePage />);
  });

  it('renders page title after loading', async () => {
    render(<EditWarehousePage />);
    await waitFor(() => {
      expect(screen.getByText(WAREHOUSE_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument();
    });
  });

  it('renders back button after loading', async () => {
    render(<EditWarehousePage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  it('renders form fields after loading', async () => {
    render(<EditWarehousePage />);
    await waitFor(() => {
      expect(screen.getByText(WAREHOUSE_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument();
      expect(screen.getByText(WAREHOUSE_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument();
    });
  });

  it('renders cancel and save buttons after loading', async () => {
    render(<EditWarehousePage />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.EDIT.BUTTONS.CANCEL })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: WAREHOUSE_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument();
    });
  });

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<EditWarehousePage />);

    const cancelButton = await screen.findByRole('button', {
      name: WAREHOUSE_LABELS.EDIT.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/warehouse');
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditWarehousePage />);

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/organization/warehouse');
  });

  it('displays not found state when API fails', async () => {
    server.use(
      http.get(getApiPath('/warehouses/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      })
    );

    render(<EditWarehousePage />);

    await waitFor(() => {
      expect(screen.getByText(/Warehouse tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
