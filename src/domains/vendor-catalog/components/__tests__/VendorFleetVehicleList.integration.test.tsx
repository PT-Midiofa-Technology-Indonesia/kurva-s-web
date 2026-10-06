import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_CATALOG_LABELS } from '../../constants';
import { useVendorFleetVehiclePage } from '../../hooks/use-vendor-fleet-vehicle-page';
import { VendorFleetVehicleList } from '../VendorFleetVehicleList';

vi.mock('../../hooks/use-vendor-fleet-vehicle-page', () => ({
  useVendorFleetVehiclePage: vi.fn(),
}));

const mockVehicles = [
  {
    id: '1',
    vendorId: 'v1',
    name: 'Truk Fuso 01',
    code: 'TRK001',
    vehicleType: 'Truck',
    plateNumber: 'B 1234 CDE',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    vendorId: 'v1',
    name: 'Pickup 01',
    code: 'PKP001',
    vehicleType: 'Pickup',
    plateNumber: 'B 5678 FGH',
    isActive: false,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

const mockUseVendorFleetVehiclePage = vi.mocked(useVendorFleetVehiclePage);

function setupMocks(overrides = {}) {
  mockUseVendorFleetVehiclePage.mockReturnValue({
    items: mockVehicles,
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
  } as unknown as ReturnType<typeof useVendorFleetVehiclePage>);
}

describe('VendorFleetVehicleList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders list title', () => {
    render(<VendorFleetVehicleList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.TITLE)).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<VendorFleetVehicleList vendorId="v1" vendorName="PT Test" />);
    expect(
      screen.getByRole('button', { name: VENDOR_CATALOG_LABELS.FLEET.ADD_BUTTON })
    ).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<VendorFleetVehicleList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.COLUMNS.NAME)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.COLUMNS.CODE)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.COLUMNS.VEHICLE_TYPE)).toBeInTheDocument();
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.COLUMNS.PLATE_NUMBER)).toBeInTheDocument();
  });

  it('renders vehicle data rows', async () => {
    render(<VendorFleetVehicleList vendorId="v1" vendorName="PT Test" />);

    await waitFor(() => {
      expect(screen.getByText('Truk Fuso 01')).toBeInTheDocument();
      expect(screen.getByText('TRK001')).toBeInTheDocument();
      expect(screen.getByText('Truck')).toBeInTheDocument();
      expect(screen.getByText('B 1234 CDE')).toBeInTheDocument();
      expect(screen.getByText('Pickup 01')).toBeInTheDocument();
    });
  });

  it('renders empty message when no data', () => {
    setupMocks({ items: [] });
    render(<VendorFleetVehicleList vendorId="v1" vendorName="PT Test" />);
    expect(screen.getByText(VENDOR_CATALOG_LABELS.FLEET.EMPTY)).toBeInTheDocument();
  });
});
