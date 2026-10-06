import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { VendorFleetVehicleFormDrawer } from '../VendorFleetVehicleFormDrawer';

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

describe('VendorFleetVehicleFormDrawer Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders when open', () => {
    render(
      <VendorFleetVehicleFormDrawer
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
      <VendorFleetVehicleFormDrawer
        open={false}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );
    expect(
      screen.queryByRole('heading', { name: VENDOR_CATALOG_LABELS.FLEET.DRAWER.ADD_TITLE })
    ).not.toBeInTheDocument();
  });

  it('displays drawer title for add mode', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: VENDOR_CATALOG_LABELS.FLEET.DRAWER.ADD_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays drawer title for edit mode', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        editItem={{
          id: '1',
          vendorId: '1',
          name: 'Truk Fuso 01',
          code: 'TRK001',
          vehicleType: 'Truck',
          plateNumber: 'B 1234 CDE',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: VENDOR_CATALOG_LABELS.FLEET.DRAWER.EDIT_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays vendor name', async () => {
    render(
      <VendorFleetVehicleFormDrawer
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

  it('displays name field label', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.NAME)).toBeInTheDocument();
    });
  });

  it('displays code field label', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.CODE)).toBeInTheDocument();
    });
  });

  it('displays vehicle type field label', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.VEHICLE_TYPE)
      ).toBeInTheDocument();
    });
  });

  it('displays plate number field label', async () => {
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.FLEET.DRAWER.FIELDS.PLATE_NUMBER)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VendorFleetVehicleFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.FLEET.DRAWER.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
