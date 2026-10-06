import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteVendorFromDraft } from '../delete-vendor';

vi.mock('@/shared/lib/axios', () => ({
  default: { delete: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('deleteVendorFromDraft API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.delete).mockReset();
  });

  it('sends DELETE with correct path and X-Company-Id header', async () => {
    vi.mocked(mockAxios.delete).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    await deleteVendorFromDraft('draft-1', 'vendor-1', 'comp-001');

    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts/draft-1/vendors/vendor-1'),
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
  });

  it('sends DELETE without X-Company-Id when companyId omitted', async () => {
    vi.mocked(mockAxios.delete).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    await deleteVendorFromDraft('draft-1', 'vendor-1');

    expect(mockAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts/draft-1/vendors/vendor-1'),
      { headers: {} }
    );
  });
});
