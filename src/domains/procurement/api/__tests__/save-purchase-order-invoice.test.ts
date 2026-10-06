import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { savePurchaseOrderInvoice } from '../save-purchase-order-invoice';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('savePurchaseOrderInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends POST multipart payload for create without _method', async () => {
    const postMock = vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Invoice created',
        data: { id: 'inv-1' },
      },
    });

    const file = new File(['dummy'], 'invoice.pdf', { type: 'application/pdf' });

    await savePurchaseOrderInvoice({
      id: 'po-1',
      companyId: 'company-1',
      isUpdate: false,
      payload: {
        invoiceNumber: 'INV-001',
        invoiceDate: '2026-07-10',
        invoiceDueDate: '2026-07-25',
        invoiceAmount: 500000,
        taxInvoiceStatus: 'approved',
        taxes: [{ taxTypeId: 'tax-1', rate: 11 }],
        documents: [
          {
            documentTypeId: 'req-invoice',
            files: [file],
            existingIds: [],
          },
        ],
      },
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [url, formData, config] = postMock.mock.calls[0];
    expect(url).toContain('/procurement/purchase-orders/po-1/invoice');
    expect(config?.headers?.['X-Company-Id']).toBe('company-1');

    const form = formData as FormData;
    expect(form.get('_method')).toBeNull();
    expect(form.get('invoiceNumber')).toBe('INV-001');
    expect(form.get('invoiceAmount')).toBe('500000');
    expect(form.get('taxes[0][taxTypeId]')).toBe('tax-1');
    expect(form.get('documents[0][documentTypeId]')).toBe('req-invoice');
    expect(form.get('documents[0][files][]')).toBe(file);
  });

  it('sends _method=PUT in multipart payload when isUpdate is true', async () => {
    const postMock = vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Invoice updated',
        data: { id: 'inv-1' },
      },
    });

    await savePurchaseOrderInvoice({
      id: 'po-1',
      isUpdate: true,
      payload: {
        invoiceNumber: 'INV-001',
        invoiceDate: '2026-07-10',
        invoiceDueDate: '2026-07-25',
        invoiceAmount: 500000,
        taxes: [],
        documents: [
          {
            documentTypeId: 'req-tax',
            files: [],
            existingIds: ['doc-1'],
          },
        ],
      },
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [, formData] = postMock.mock.calls[0];
    const form = formData as FormData;
    expect(form.get('_method')).toBe('PUT');
    expect(form.get('documents[0][documentTypeId]')).toBe('req-tax');
    expect(form.get('existingDocumentIds[]')).toBe('doc-1');
  });
});
