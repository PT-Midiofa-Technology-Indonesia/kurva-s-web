import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { VendorCapabilityFormDrawer } from '../VendorCapabilityFormDrawer';

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

describe('VendorCapabilityFormDrawer Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders when open', () => {
    render(
      <VendorCapabilityFormDrawer
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
      <VendorCapabilityFormDrawer
        open={false}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );
    expect(
      screen.queryByRole('heading', { name: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.ADD_TITLE })
    ).not.toBeInTheDocument();
  });

  it('displays drawer title for add mode', async () => {
    render(
      <VendorCapabilityFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.ADD_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays drawer title for edit mode', async () => {
    render(
      <VendorCapabilityFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        editItem={{
          id: '1',
          vendorId: '1',
          skillCatalogId: 'skill-1',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          skillCatalog: { id: 'skill-1', code: 'SK001', name: 'Skill 1', isActive: true },
        }}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.EDIT_TITLE })
      ).toBeInTheDocument();
    });
  });

  it('displays vendor name', async () => {
    render(
      <VendorCapabilityFormDrawer
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

  it('displays skill field label', async () => {
    render(
      <VendorCapabilityFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.FIELDS.SKILL)
      ).toBeInTheDocument();
    });
  });

  it('displays status field label', async () => {
    render(
      <VendorCapabilityFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.FIELDS.STATUS)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VendorCapabilityFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.CAPABILITY.DRAWER.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
