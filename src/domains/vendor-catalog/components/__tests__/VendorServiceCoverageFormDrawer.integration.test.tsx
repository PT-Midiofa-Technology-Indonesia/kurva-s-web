import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { VendorServiceCoverageFormDrawer } from '../VendorServiceCoverageFormDrawer';

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

describe('VendorServiceCoverageFormDrawer Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders when open', () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );
  });

  it('does not render drawer content when closed', () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={false}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );
    expect(
      screen.queryByRole('heading', {
        name: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.TITLE,
      })
    ).not.toBeInTheDocument();
  });

  it('displays drawer title', async () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.TITLE,
        })
      ).toBeInTheDocument();
    });
  });

  it('displays vendor name', async () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test Company"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('PT Test Company')).toBeInTheDocument();
    });
  });

  it('renders a single empty coverage entry when no existingItems provided', async () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.PROVINCE)
      ).toHaveLength(1);
    });
  });

  it('renders multiple coverage entries when existingItems provided', async () => {
    const existingItems = [
      {
        vendorId: '1',
        provinceId: 'prov-1',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        province: { id: 'prov-1', code: '32', name: 'Jawa Barat', isActive: true },
        cities: [
          {
            id: 'city-1',
            provinceId: 'prov-1',
            code: '3273',
            name: 'Bandung',
            type: null,
            isActive: true,
          },
        ],
      },
      {
        vendorId: '1',
        provinceId: 'prov-2',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        province: { id: 'prov-2', code: '33', name: 'Jawa Tengah', isActive: true },
        cities: [],
      },
    ];

    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        existingItems={existingItems}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.PROVINCE)
      ).toHaveLength(2);
    });
  });

  it('displays province field label', async () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.PROVINCE)
      ).toBeInTheDocument();
    });
  });

  it('displays city field label', async () => {
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.FIELDS.CITY)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VendorServiceCoverageFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.DRAWER.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
