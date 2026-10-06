import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { useVendorOfferingDocumentPage } from '../../hooks/use-vendor-offering-document-page';
import { VendorOfferingDocumentList } from '../VendorOfferingDocumentList';

vi.mock('../../hooks/use-vendor-offering-document-page', () => ({
  useVendorOfferingDocumentPage: vi.fn(),
}));

const mockDocuments = [
  {
    id: '1',
    vendorId: 'v1',
    code: 'DOCCC-0001',
    title: 'Dokumen Penawaran Q3',
    periodStart: '2026-01-01',
    periodEnd: '2026-08-31',
    description: 'Test description',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockUseVendorOfferingDocumentPage = vi.mocked(useVendorOfferingDocumentPage);

function setupMocks(overrides = {}) {
  mockUseVendorOfferingDocumentPage.mockReturnValue({
    items: mockDocuments,
    totalItems: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    isSaving: false,
    isUpdating: false,
    deleteTarget: null,
    setDeleteTarget: vi.fn(),
    editTarget: null,
    isDrawerOpen: false,
    handleAdd: vi.fn(),
    handleEdit: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleStatusToggle: vi.fn(),
    handleDrawerClose: vi.fn(),
    handleSave: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useVendorOfferingDocumentPage>);
}

describe('VendorOfferingDocumentList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders list title', () => {
    render(<VendorOfferingDocumentList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.TITLE)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<VendorOfferingDocumentList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<VendorOfferingDocumentList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.COLUMNS.TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.COLUMNS.PERIOD)
    ).toBeInTheDocument();
    expect(
      screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.COLUMNS.UPDATED_AT)
    ).toBeInTheDocument();
  });

  it('renders document data rows', async () => {
    render(<VendorOfferingDocumentList vendorId="v1" vendorName="PT Test" />);

    await waitFor(() => {
      expect(screen.getByText('Dokumen Penawaran Q3')).toBeInTheDocument();
    });
  });

  it('renders empty message when no data', () => {
    setupMocks({ items: [] });
    render(<VendorOfferingDocumentList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.OFFERING_DOCUMENT.EMPTY)).toBeInTheDocument();
  });
});
