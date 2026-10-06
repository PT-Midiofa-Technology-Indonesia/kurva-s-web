import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import * as useCancelPurchaseOrderModule from '../../hooks/use-cancel-purchase-order';
import * as useIssuePurchaseOrderModule from '../../hooks/use-issue-purchase-order';
import * as usePurchaseOrderDetailModule from '../../hooks/use-purchase-order-detail';
import * as usePurchaseOrderRatingModule from '../../hooks/use-purchase-order-rating';
import * as useSavePurchaseOrderInvoiceModule from '../../hooks/use-save-purchase-order-invoice';
import * as useUpdatePurchaseOrderModule from '../../hooks/use-update-purchase-order';
import { PurchaseOrderDetailPage } from '../PurchaseOrderDetailPage';

const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'po-1' }),
  useRouter: () => ({ back: mockBack }),
  useSearchParams: () => new URLSearchParams('companyId=company-1'),
}));

vi.mock('@/shared/components/templates/DataTableLayout', () => ({
  DataTableLayout: () => <div data-testid="data-table-layout" />,
}));

vi.mock('../../components/PurchaseOrderRatingModal', () => ({
  PurchaseOrderRatingModal: () => <div data-testid="purchase-order-rating-modal" />,
}));

const purchaseOrderDetail = {
  id: 'po-1',
  code: 'PO-001',
  projectId: 'project-1',
  project: { id: 'project-1', name: 'Project Alpha', code: 'PRJ-001' },
  projectName: 'Project Alpha',
  projectCode: 'PRJ-001',
  companyId: 'company-1',
  companyName: 'PT Curva Mobile',
  vendorId: 'vendor-1',
  vendor: { id: 'vendor-1', name: 'Vendor Prima', code: 'VN-001' },
  vendorName: 'Vendor Prima',
  vendorAddress: 'Jakarta',
  status: 'draft',
  statusLabel: 'Draft',
  sourceDraftId: 'draft-1',
  sourceDraftCode: 'DR-001',
  notes: '',
  invoice: {
    id: 'invoice-1',
    invoiceNumber: 'INV-001',
    invoiceDate: '2026-07-10',
    invoiceDueDate: '2026-07-25',
    invoiceAmount: 250000,
    taxInvoiceNumber: 'FP-001',
    taxInvoiceDate: '2026-07-11',
    taxInvoiceStatus: 'approved',
    taxpayerNpwp: '01.234.567.8-999.000',
    taxes: [],
    documentRequirements: [
      {
        id: 'doc-type-invoice',
        code: 'INVOICE',
        name: 'Invoice',
        uploadedDocuments: [
          {
            id: 'file-1',
            fileName: 'invoice.pdf',
            filePath: 'https://example.com/invoice.pdf',
            fileSize: 1234,
            mimeType: 'application/pdf',
            createdAt: '2026-07-10T00:00:00.000Z',
          },
        ],
      },
      {
        id: 'doc-type-tax',
        code: 'FRAKTUR_PAJAK',
        name: 'Faktur Pajak',
        uploadedDocuments: [],
      },
    ],
    createdAt: '2026-07-10T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z',
  },
  items: [
    {
      id: 'item-1',
      prSource: 'PR-001',
      volPo: 2,
      uom: 'pcs',
      unitPrice: 100000,
      totalPrice: 200000,
      remarks: 'Urgent',
    },
  ],
};

const purchaseOrderRatingEnvelope = {
  vendor: { id: 'vendor-1', name: 'Vendor Prima' },
  activeCategories: [
    {
      id: 'cat-1',
      code: 'capability',
      name: 'Capability',
      description: 'Kemampuan vendor',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'cat-2',
      code: 'quality',
      name: 'Quality',
      description: 'Kualitas vendor',
      sortOrder: 2,
      isActive: true,
    },
  ],
  rating: {
    id: 'rating-1',
    ratedAt: '2026-07-10T10:30:00.000Z',
    overallScore: 4,
    note: 'Kinerja sesuai ekspektasi.',
    ratedBy: { id: 'user-1', name: 'Admin' },
    source: {
      type: 'purchase_order',
      id: 'po-1',
      label: 'PO-001',
      deleted: false,
    },
    scores: [
      {
        categoryId: 'cat-1',
        categoryCode: 'capability',
        categoryName: 'Capability',
        categoryStatus: 'active',
        score: 4,
        note: 'Responsif saat koordinasi.',
      },
      {
        categoryId: 'cat-2',
        categoryCode: 'quality',
        categoryName: 'Quality',
        categoryStatus: 'active',
        score: 5,
        note: null,
      },
    ],
  },
};

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    mockBack.mockClear();

    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: purchaseOrderDetail,
      isLoading: false,
      isError: false,
    } as never);

    vi.spyOn(usePurchaseOrderRatingModule, 'usePurchaseOrderRating').mockReturnValue({
      data: purchaseOrderRatingEnvelope,
      isLoading: false,
      isError: false,
    } as never);

    vi.spyOn(useIssuePurchaseOrderModule, 'useIssuePurchaseOrder').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.spyOn(useCancelPurchaseOrderModule, 'useCancelPurchaseOrder').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.spyOn(useUpdatePurchaseOrderModule, 'useUpdatePurchaseOrder').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.spyOn(useSavePurchaseOrderInvoiceModule, 'useSavePurchaseOrderInvoice').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders purchase order draft header and actions', () => {
    render(<PurchaseOrderDetailPage />);

    expect(screen.getByText('Detail Purchase Order — Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Vendor Prima')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Issue PO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel PO' })).toBeInTheDocument();
  });

  it('renders invoice and document sections when purchase order is issued', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'issued',
        statusLabel: 'Issued',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getAllByText('Invoice dan Faktur').length).toBeGreaterThan(0);
    expect(screen.getByText('Dokumen')).toBeInTheDocument();
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
    expect(
      screen.queryByText('PO sudah Issued. Hanya PO berstatus Draft yang bisa diedit.')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Silahkan Lengkapi Data Invoice, Faktur dan Dokumen dibawah')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lengkapi Data' })).toBeInTheDocument();
  });

  it('renders edit CTA when purchase order is in progress', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'in_progress',
        statusLabel: 'In Progress',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.queryByText('PO sudah Issued. Hanya PO berstatus Draft yang bisa diedit.')
    ).not.toBeInTheDocument();
  });

  it('hides invoice CTA for statuses other than issued and in progress', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'completed',
        statusLabel: 'Completed',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.queryByRole('button', { name: 'Lengkapi Data' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
    expect(
      screen.queryByText('PO sudah Issued. Hanya PO berstatus Draft yang bisa diedit.')
    ).not.toBeInTheDocument();
  });

  it('renders print PO button when purchase order is issued', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'issued',
        statusLabel: 'Issued',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('renders print PO button when purchase order is in_progress', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'in_progress',
        statusLabel: 'In Progress',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('renders print PO button when purchase order is completed', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'completed',
        statusLabel: 'Completed',
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });

  it('renders Waiting Approval badge and Cancel PO button when purchase order status is waiting_approval', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'waiting_approval',
        statusLabel: 'Waiting Approval',
        totalAmount: 1000000,
        taxAmount: 110000,
        grandTotal: 1110000,
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByText('Waiting Approval')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel PO' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Issue PO' })).not.toBeInTheDocument();
    expect(screen.getByText('DPP (Nilai Sebelum Pajak)')).toBeInTheDocument();
    expect(screen.getByText('Total Pajak')).toBeInTheDocument();
    expect(screen.getByText('Rp 110.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.110.000')).toBeInTheDocument();
  });

  it('renders minus sign for deduction taxes in invoice taxes summary', () => {
    vi.spyOn(usePurchaseOrderDetailModule, 'usePurchaseOrderDetail').mockReturnValue({
      data: {
        ...purchaseOrderDetail,
        status: 'issued',
        statusLabel: 'Issued',
        totalAmount: 1000000,
        grandTotal: 1090000,
        invoice: {
          ...purchaseOrderDetail.invoice,
          taxes: [
            {
              taxTypeId: 'tax-1',
              taxTypeCode: 'PPN_11',
              taxTypeName: 'PPN',
              rate: 11,
              taxableAmount: 1000000,
              taxAmount: 110000,
              effect: 'ADDITION',
            },
            {
              taxTypeId: 'tax-2',
              taxTypeCode: 'PPH_23',
              taxTypeName: 'PPh 23',
              rate: 2,
              taxableAmount: 1000000,
              taxAmount: 20000,
              effect: 'DEDUCTION',
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as never);

    render(<PurchaseOrderDetailPage />);

    expect(screen.getByText('PPN (11%)')).toBeInTheDocument();
    expect(screen.getByText('Rp 110.000')).toBeInTheDocument();
    expect(screen.getByText('PPh 23 (2%)')).toBeInTheDocument();
    expect(screen.getByText('- Rp 20.000')).toBeInTheDocument();
  });
});
