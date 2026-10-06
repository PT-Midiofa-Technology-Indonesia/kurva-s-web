import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { useVendorRatingSummary } from '../../hooks/use-vendor-rating-summary';
import { VendorCatalogDetailInfo } from '../VendorCatalogDetailInfo';

vi.mock('../../hooks/use-vendor-rating-summary', () => ({
  useVendorRatingSummary: vi.fn(),
}));

const mockUseVendorRatingSummary = vi.mocked(useVendorRatingSummary);

const vendor = {
  id: 'vendor-1',
  code: 'V-001',
  name: 'Vendor Sukses',
  isSubcontractor: true,
  isSupplier: false,
  isLogistic: false,
  npwp: '',
  siupNumber: '',
  phone: '',
  email: '',
  provinceId: '',
  cityId: '',
  districtId: '',
  villageId: '',
  postalCode: '',
  addressDetail: '',
  contactPersonName: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
  notes: '',
  isActive: true,
  createdAt: '2026-07-15T00:00:00+00:00',
  updatedAt: '2026-07-15T00:00:00+00:00',
  province: { id: 'p1', code: 'P1', name: 'Provinsi', isActive: true },
  city: { id: 'c1', code: 'C1', name: 'Kota', isActive: true },
  district: { id: 'd1', code: 'D1', name: 'Kecamatan', isActive: true },
  village: { id: 'v1', code: 'V1', name: 'Kelurahan', isActive: true },
};

describe('VendorCatalogDetailInfo rating summary', () => {
  it('renders vendor rating summary above the tabs', () => {
    mockUseVendorRatingSummary.mockReturnValue({
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4,
          totalRatings: 3,
          lastRatedAt: '2026-07-15 00:00:00',
          perCategory: [],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <VendorCatalogDetailInfo vendor={vendor as any} vendorId={vendor.id} onEdit={vi.fn()} />
    );

    expect(screen.getByText('Ringkasan Rating')).toBeInTheDocument();
    expect(screen.getByText('Overall Score')).toBeInTheDocument();
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
    expect(screen.getByText('15 Juli 2026')).toBeInTheDocument();
  });
});
