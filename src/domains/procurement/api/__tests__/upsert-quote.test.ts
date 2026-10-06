import { beforeEach, describe, expect, it, vi } from 'vitest';
import { upsertQuote } from '../upsert-quote';

vi.mock('@/shared/lib/axios', () => ({
  default: { put: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('upsertQuote API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.put).mockReset();
  });

  it('sends PUT with quote payload and X-Company-Id header', async () => {
    vi.mocked(mockAxios.put).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    await upsertQuote(
      'draft-1',
      { draftItemId: 'item-1', vendorId: 'vendor-1', unitPrice: 50000 },
      'comp-001'
    );

    expect(mockAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts/draft-1/quotes'),
      { draftItemId: 'item-1', vendorId: 'vendor-1', unitPrice: 50000 },
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
  });
});
