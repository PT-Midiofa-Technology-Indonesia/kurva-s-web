import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadOfferingDoc } from '../upload-offering-doc';

vi.mock('@/shared/lib/axios', () => ({
  default: { post: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('uploadOfferingDoc API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.post).mockReset();
  });

  it('sends FormData with multipart header and X-Company-Id', async () => {
    vi.mocked(mockAxios.post).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await uploadOfferingDoc(
      'draft-1',
      {
        vendorId: 'vendor-1',
        title: 'Offering Doc',
        periodStart: '2025-01-01',
        periodEnd: '2025-12-31',
        file,
        notes: 'Some notes',
      },
      'comp-001'
    );

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts/draft-1/offering-docs'),
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Company-Id': 'comp-001',
        },
      }
    );
  });
});
