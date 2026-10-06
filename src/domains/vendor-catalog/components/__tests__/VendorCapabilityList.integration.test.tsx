import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { useVendorCapabilityPage } from '../../hooks/use-vendor-capability-page';
import { VendorCapabilityList } from '../VendorCapabilityList';

vi.mock('../../hooks/use-vendor-capability-page', () => ({
  useVendorCapabilityPage: vi.fn(),
}));

const mockCapabilities = [
  {
    id: '1',
    vendorId: 'v1',
    skillCatalogId: 's1',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    skillCatalog: { id: 's1', code: 'SK001', name: 'Skill 1', isActive: true },
  },
  {
    id: '2',
    vendorId: 'v1',
    skillCatalogId: 's2',
    isActive: false,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    skillCatalog: { id: 's2', code: 'SK002', name: 'Skill 2', isActive: true },
  },
];

const mockUseVendorCapabilityPage = vi.mocked(useVendorCapabilityPage);

function setupMocks(overrides = {}) {
  mockUseVendorCapabilityPage.mockReturnValue({
    items: mockCapabilities,
    totalItems: 2,
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
  } as unknown as ReturnType<typeof useVendorCapabilityPage>);
}

describe('VendorCapabilityList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders list title', () => {
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.TITLE)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.CAPABILITY.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.CODE)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.NAME)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.COLUMNS.STATUS)).toBeInTheDocument();
  });

  it('renders capability data rows', async () => {
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);

    await waitFor(() => {
      expect(screen.getByText('SK001')).toBeInTheDocument();
      expect(screen.getByText('Skill 1')).toBeInTheDocument();
      expect(screen.getByText('SK002')).toBeInTheDocument();
      expect(screen.getByText('Skill 2')).toBeInTheDocument();
    });
  });

  it('renders empty message when no data', () => {
    setupMocks({ items: [] });
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.EMPTY)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    setupMocks({ items: [], isLoading: true });
    render(<VendorCapabilityList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.CAPABILITY.TITLE)).toBeInTheDocument();
  });
});
