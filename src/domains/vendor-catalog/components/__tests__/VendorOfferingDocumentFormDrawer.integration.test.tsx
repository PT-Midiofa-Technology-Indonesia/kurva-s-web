import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { VendorOfferingDocumentFormDrawer } from '../VendorOfferingDocumentFormDrawer';

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

describe('VendorOfferingDocumentFormDrawer Integration', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders when open', () => {
    render(
      <VendorOfferingDocumentFormDrawer
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
      <VendorOfferingDocumentFormDrawer
        open={false}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );
    expect(
      screen.queryByRole('heading', {
        name: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.ADD_TITLE,
      })
    ).not.toBeInTheDocument();
  });

  it('displays drawer title for add mode', async () => {
    render(
      <VendorOfferingDocumentFormDrawer
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
          name: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.ADD_TITLE,
        })
      ).toBeInTheDocument();
    });
  });

  it('displays drawer title for edit mode', async () => {
    render(
      <VendorOfferingDocumentFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        editItem={{
          id: '1',
          vendorId: '1',
          code: 'DOCCC-0001',
          title: 'Doc 1',
          periodStart: '2026-01-01',
          periodEnd: '2026-08-15',
          description: 'Test',
          isActive: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.EDIT_TITLE,
        })
      ).toBeInTheDocument();
    });
  });

  it('displays vendor name', async () => {
    render(
      <VendorOfferingDocumentFormDrawer
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

  it('displays title field label', async () => {
    render(
      <VendorOfferingDocumentFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.TITLE)
      ).toBeInTheDocument();
    });
  });

  it('displays offer date field label', async () => {
    render(
      <VendorOfferingDocumentFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.FIELDS.PERIOD_START)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VendorOfferingDocumentFormDrawer
        open={true}
        onClose={mockOnClose}
        vendorId="1"
        vendorName="PT Test"
        onSave={mockOnSave}
      />
    );

    const cancelButton = await screen.findByRole('button', {
      name: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.DRAWER.BUTTONS.CANCEL,
    });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
