import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPoDraft } from '../create-po-draft';

vi.mock('@/shared/lib/axios', () => ({
  default: { post: vi.fn() },
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

describe('createPoDraft API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.post).mockReset();
  });

  it('posts the draft payload with X-Company-Id header when companyId provided', async () => {
    vi.mocked(mockAxios.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          id: 'draft-1',
          code: 'PP-2025/0001',
          status: 'draft',
          projectId: 'proj-1',
          projectName: 'Test',
          type: 'materialTool',
          items: [],
        },
      },
    });

    const result = await createPoDraft(
      {
        projectId: 'proj-1',
        type: 'materialTool',
        items: [{ purchaseRequestItemId: 'pr-item-1', quantity: 50 }],
      },
      'comp-001'
    );

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts'),
      {
        projectId: 'proj-1',
        type: 'materialTool',
        items: [{ purchaseRequestItemId: 'pr-item-1', quantity: 50 }],
      },
      { headers: { 'X-Company-Id': 'comp-001' } }
    );
    expect(result.id).toBe('draft-1');
  });

  it('posts without X-Company-Id header when companyId omitted', async () => {
    vi.mocked(mockAxios.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          id: 'draft-2',
          code: 'PP-2025/0002',
          status: 'draft',
          projectId: 'proj-1',
          projectName: 'Test',
          type: 'serviceRental',
          items: [],
        },
      },
    });

    await createPoDraft({
      projectId: 'proj-1',
      type: 'serviceRental',
      items: [],
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/procurement/po-drafts'),
      expect.anything(),
      { headers: undefined }
    );
  });
});
