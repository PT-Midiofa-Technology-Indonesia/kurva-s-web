import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPurchaseRequestManual } from '../create-purchase-request-manual';

vi.mock('@/shared/lib/axios', () => ({
  default: { post: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('createPurchaseRequestManual API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.post).mockReset();
  });

  it('posts the manual PR payload with X-Company-Id header, excluding companyId from the body', async () => {
    vi.mocked(mockAxios.post).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: null },
    });

    await createPurchaseRequestManual({
      companyId: 'comp-001',
      projectId: 'proj-001',
      dateRequired: '2026-07-15',
      items: [
        {
          itemType: 'materialTool',
          item: [{ boqItemCostId: 'cost-1', quantity: 50, remarks: 'Merek Tiga Roda' }],
        },
      ],
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      '/v1/procurement/purchase-requests/manual',
      {
        projectId: 'proj-001',
        dateRequired: '2026-07-15',
        items: [
          {
            itemType: 'materialTool',
            item: [{ boqItemCostId: 'cost-1', quantity: 50, remarks: 'Merek Tiga Roda' }],
          },
        ],
      },
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
  });
});
