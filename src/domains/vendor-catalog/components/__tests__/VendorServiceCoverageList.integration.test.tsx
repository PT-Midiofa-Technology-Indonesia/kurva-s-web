import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { useVendorServiceCoveragePage } from '../../hooks/use-vendor-service-coverage-page';
import { VendorServiceCoverageList } from '../VendorServiceCoverageList';

vi.mock('../../hooks/use-vendor-service-coverage-page', () => ({
  useVendorServiceCoveragePage: vi.fn(),
}));

const mockCoverages = [
  {
    vendorId: 'v1',
    provinceId: 'p1',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    province: { id: 'p1', code: '32', name: 'Jawa Barat', isActive: true },
    cities: [
      { id: 'c1', provinceId: 'p1', code: '3273', name: 'Bandung', type: null, isActive: true },
    ],
  },
];

const mockUseVendorServiceCoveragePage = vi.mocked(useVendorServiceCoveragePage);

function setupMocks(overrides = {}) {
  mockUseVendorServiceCoveragePage.mockReturnValue({
    items: mockCoverages,
    totalItems: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    isSaving: false,
    isDrawerOpen: false,
    handleAdd: vi.fn(),
    handleDrawerClose: vi.fn(),
    handleSave: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useVendorServiceCoveragePage>);
}

describe('VendorServiceCoverageList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders list title', () => {
    render(<VendorServiceCoverageList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.TITLE)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<VendorServiceCoverageList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<VendorServiceCoverageList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.COLUMNS.PROVINCE)
    ).toBeInTheDocument();
    expect(
      screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.COLUMNS.CITY)
    ).toBeInTheDocument();
  });

  it('renders coverage data rows', async () => {
    render(<VendorServiceCoverageList vendorId="v1" vendorName="PT Test" />);

    await waitFor(() => {
      expect(screen.getByText(/Jawa Barat/)).toBeInTheDocument();
    });
  });

  it('renders empty message when no data', () => {
    setupMocks({ items: [] });
    render(<VendorServiceCoverageList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.SERVICE_COVERAGE.EMPTY)).toBeInTheDocument();
  });
});
