import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPurchaseRequestBundle } from '../create-purchase-request-bundle';

vi.mock('@/shared/lib/axios', () => ({
  default: { post: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('createPurchaseRequestBundle API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.post).mockReset();
  });

  it('posts the bundle PR payload with X-Company-Id header, excluding companyId from the body', async () => {
    vi.mocked(mockAxios.post).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    await createPurchaseRequestBundle({
      companyId: 'comp-001',
      projectId: 'proj-001',
      boqItemId: 'item-001',
      categories: ['material', 'manpower', 'equipment'],
      dateRequired: '2026-07-20',
      notes: 'Bundle seluruh pekerjaan struktur lantai 1 ke subkontraktor',
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/procurement/purchase-requests/bundle',
      {
        projectId: 'proj-001',
        boqItemId: 'item-001',
        categories: ['material', 'manpower', 'equipment'],
        dateRequired: '2026-07-20',
        notes: 'Bundle seluruh pekerjaan struktur lantai 1 ke subkontraktor',
      },
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
  });
});
