import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBOQProjects } from '../get-boq-projects';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const { default: mockAxios } = await import('@/lib/axios');

describe('getBOQProjects API', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.get).mockReset();
  });

  it('calls API with X-Company-Id header when companyId is provided', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, lastPage: 1 } },
    });

    await getBOQProjects({
      boqStage: 'planning',
      companyId: 'comp-001',
      page: 1,
      perPage: 10,
    });

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/projects',
      expect.objectContaining({
        headers: { 'X-Company-Id': 'comp-001' },
      })
    );
  });

  it('calls API without X-Company-Id header when companyId is not provided', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, lastPage: 1 } },
    });

    await getBOQProjects({
      boqStage: 'planning',
      page: 1,
      perPage: 10,
    });

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/projects',
      expect.objectContaining({
        headers: undefined,
      })
    );
  });

  it('passes all params to API call', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({
      data: { data: [], meta: { total: 0, lastPage: 1 } },
    });

    await getBOQProjects({
      boqStage: 'final',
      companyId: 'comp-002',
      statusBoqFinal: true,
      page: 2,
      perPage: 20,
      search: 'test',
    });

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/projects',
      expect.objectContaining({
        params: {
          boqStage: 'final',
          companyId: 'comp-002',
          statusBoqFinal: true,
          page: 2,
          perPage: 20,
          search: 'test',
        },
      })
    );
  });
});
