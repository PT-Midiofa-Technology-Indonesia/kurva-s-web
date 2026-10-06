import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../../mocks/server';
import { getHandlerPath as getApiPath } from '../../../../shared/lib/api-config';
import { render } from '../../../../shared/utils/test-utils';
import { DoDetailPage } from '../DoDetailPage';

const { mockPush, mockUseParams, mockUseSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseParams: vi.fn(() => ({ id: 'do-1' })),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  usePathname: () => '/logistic/delivery-order/do-1',
  useSearchParams: mockUseSearchParams,
  useParams: mockUseParams,
}));

describe('DoDetailPage Integration', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseParams.mockReturnValue({ id: 'do-1' });
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('renders without crashing', async () => {
    render(<DoDetailPage />);
    expect(await screen.findByText('Delivery Order Detail')).toBeInTheDocument();
  });

  it('displays delivery order code and status', async () => {
    render(<DoDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('DO/GEN/2026/0001')).toBeInTheDocument();
    });
    expect(screen.getByText('Requested')).toBeInTheDocument();
  });

  it('displays source and destination warehouses', async () => {
    render(<DoDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Warehouse A (Gudang Utama)')).toBeInTheDocument();
    });
  });

  it('displays purchase orders table', async () => {
    render(<DoDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('PKJ-A/PO/2026/0001')).toBeInTheDocument();
    });
  });

  it('displays items table', async () => {
    render(<DoDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Bata Merah ukuran 20x40')).toBeInTheDocument();
    });
  });

  it('shows confirm dialog when delete PO is clicked', async () => {
    const user = userEvent.setup();
    render(<DoDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('PKJ-A/PO/2026/0001')).toBeInTheDocument();
    });

    // Find and click the trash button in the PO table
    const trashButtons = document.querySelectorAll('button');
    const trashButton = Array.from(trashButtons).find((btn) =>
      btn.querySelector('.lucide-trash-2')
    );
    expect(trashButton).toBeDefined();
    await user.click(trashButton!);

    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/Yakin ingin menghapus PO/)).toBeInTheDocument();
    });
  });

  it('shows error state for invalid id', async () => {
    mockUseParams.mockReturnValue({ id: 'invalid-id' });
    server.use(
      http.get(getApiPath('/logistic/delivery-orders/:id'), () => {
        return HttpResponse.json(
          { success: false, message: 'Data tidak ditemukan' },
          { status: 404 }
        );
      })
    );

    render(<DoDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat data/)).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<DoDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Delivery Order Detail')).toBeInTheDocument();
    });

    // Click the back button (first button before the title)
    const backButton = document.querySelector('button');
    if (backButton) {
      await user.click(backButton);
      expect(mockPush).toHaveBeenCalledWith('/logistic/delivery-order');
    }
  });
});
