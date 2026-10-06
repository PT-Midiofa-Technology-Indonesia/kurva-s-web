import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { VENDOR_DIRECTORY_TABS } from '../../constants';
import { VendorDirectoryPage } from '../VendorDirectoryPage';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/vendor-management/vendor-directory',
  useSearchParams: () => mockSearchParams,
  useParams: () => ({}),
}));

function syncWindowLocationSearchParams(params: URLSearchParams) {
  const qs = params.toString();
  const url = qs
    ? `/vendor-management/vendor-directory?${qs}`
    : '/vendor-management/vendor-directory';
  window.history.replaceState({}, '', url);
}

const h = (path: string) => getApiPath(path);

const dummyItemCatalog = {
  id: 'vic-001',
  vendorId: 'vnd-001',
  vendor: { id: 'vnd-001', code: 'VND-2026-0001', name: 'PT Sinergi Semesta Raya' },
  itemCatalogId: 'ic-001',
  itemCatalog: { id: 'ic-001', code: 'IC001', name: 'Batu Bata' },
  price: '12500',
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
};

const dummyCapability = {
  id: 'cap-001',
  vendorId: 'vnd-001',
  vendor: { id: 'vnd-001', code: 'VND-2026-0001', name: 'PT Sinergi Semesta Raya' },
  skillCatalogId: 'sk-001',
  skillCatalog: { id: 'sk-001', code: 'SK01', name: 'Welding' },
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
};

const dummyServiceCoverage = {
  vendorId: 'vnd-001',
  vendor: { id: 'vnd-001', code: 'VND-2026-0001', name: 'PT Sinergi Semesta Raya' },
  provinceId: 'pv-001',
  province: { id: 'pv-001', code: '31', name: 'DKI JAKARTA', isActive: true },
  cities: [{ id: 'ct-001', provinceId: 'pv-001', code: '3171', name: 'JAKARTA SELATAN' }],
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
};

const dummyOfferingDocument = {
  id: 'od-001',
  vendorId: 'vnd-001',
  vendor: { id: 'vnd-001', code: 'VND-2026-0001', name: 'PT Sinergi Semesta Raya' },
  code: 'OD-001',
  title: 'Company Profile',
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  description: '',
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
};

const dummyFleet = {
  id: 'fv-001',
  vendorId: 'vnd-001',
  vendor: { id: 'vnd-001', code: 'VND-2026-0001', name: 'PT Sinergi Semesta Raya' },
  name: 'Truck A',
  vehicleType: 'Pickup',
  plateNumber: 'B 1234 ABC',
  isActive: true,
  createdAt: '2026-05-20T00:00:00.000Z',
  updatedAt: '2026-05-20T00:00:00.000Z',
};

const paginated = <T,>(data: T[]) => ({
  success: true,
  message: 'Data retrieved successfully',
  data,
  meta: { currentPage: 1, perPage: 10, total: data.length, lastPage: 1, from: 1, to: data.length },
  links: { first: '', last: '', prev: null, next: null },
});

function installMockHandlers() {
  server.use(
    http.get(h('/vendor-item-catalogs'), () => HttpResponse.json(paginated([dummyItemCatalog]))),
    http.get(h('/vendor-capabilities'), () => HttpResponse.json(paginated([dummyCapability]))),
    http.get(h('/vendor-service-coverages'), () =>
      HttpResponse.json(paginated([dummyServiceCoverage]))
    ),
    http.get(h('/vendor-offering-documents'), () =>
      HttpResponse.json(paginated([dummyOfferingDocument]))
    ),
    http.get(h('/vendor-fleet-vehicles'), () => HttpResponse.json(paginated([dummyFleet])))
  );
}

describe('VendorDirectoryPage Integration', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, k) => {
      mockSearchParams.delete(k);
    });
    syncWindowLocationSearchParams(mockSearchParams);
  });

  afterEach(() => {
    mockReplace.mockClear();
    mockSearchParams.forEach((_, k) => {
      mockSearchParams.delete(k);
    });
    syncWindowLocationSearchParams(mockSearchParams);
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
  });

  it('displays the default tab heading', async () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Item Catalog' })).toBeInTheDocument();
    });
  });

  it('renders all five tab labels', async () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Item Catalog' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Capabilities' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Service Coverage' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: 'Offering Document' }).length).toBeGreaterThan(
        0
      );
      expect(screen.getAllByRole('button', { name: 'Fleet' }).length).toBeGreaterThan(0);
    });
  });

  it('shows Item Catalog content as the default tab', async () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Batu Bata').length).toBeGreaterThan(0);
    });
  });

  it('shows search input and status filter on the default tab', async () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Pencarian').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Semua Status')).toBeInTheDocument();
  });

  it('switches to Capabilities tab and loads its content', async () => {
    installMockHandlers();
    const user = userEvent.setup();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    render(<VendorDirectoryPage />);

    await user.click(screen.getAllByRole('button', { name: 'Capabilities' })[0]);

    await waitFor(() => {
      expect(pushStateSpy).toHaveBeenCalledWith(
        {},
        '',
        expect.stringContaining(`tab=${VENDOR_DIRECTORY_TABS.CAPABILITY}`)
      );
    });

    pushStateSpy.mockRestore();
  });

  it('switches to Service Coverage tab via the URL', async () => {
    installMockHandlers();
    mockSearchParams.set('tab', VENDOR_DIRECTORY_TABS.SERVICE_COVERAGE);
    syncWindowLocationSearchParams(mockSearchParams);
    render(<VendorDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText('JAKARTA SELATAN')).toBeInTheDocument();
    });
  });

  it('switches to Offering Document tab via the URL', async () => {
    installMockHandlers();
    mockSearchParams.set('tab', VENDOR_DIRECTORY_TABS.OFFERING_DOCUMENT);
    syncWindowLocationSearchParams(mockSearchParams);
    render(<VendorDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Company Profile')).toBeInTheDocument();
    });
  });

  it('switches to Fleet tab via the URL', async () => {
    installMockHandlers();
    mockSearchParams.set('tab', VENDOR_DIRECTORY_TABS.FLEET);
    syncWindowLocationSearchParams(mockSearchParams);
    render(<VendorDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Truck A')).toBeInTheDocument();
    });
  });

  it('omits the tab query param when switching back to the default Item Catalog tab', async () => {
    installMockHandlers();
    mockSearchParams.set('tab', VENDOR_DIRECTORY_TABS.FLEET);
    syncWindowLocationSearchParams(mockSearchParams);
    const user = userEvent.setup();
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    render(<VendorDirectoryPage />);

    await user.click(screen.getAllByRole('button', { name: 'Item Catalog' })[0]);

    await waitFor(() => {
      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/vendor-management/vendor-directory');
    });

    pushStateSpy.mockRestore();
  });

  it('does not show an Add button (read-only view)', async () => {
    installMockHandlers();
    render(<VendorDirectoryPage />);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /tambah/i })).not.toBeInTheDocument();
    });
  });

  it('displays error state when the API fails', async () => {
    server.use(
      http.get(h('/vendor-item-catalogs'), () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      )
    );

    render(<VendorDirectoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument();
    });
  });
});
