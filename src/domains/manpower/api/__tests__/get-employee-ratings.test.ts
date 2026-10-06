import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getEmployeeRatings } from '../get-employee-ratings';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('getEmployeeRatings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests employee rating history with filters and pagination and no company header', async () => {
    const response = {
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: [],
        meta: { currentPage: 2, perPage: 5, total: 0, lastPage: 1, from: null, to: null },
        links: { first: '', last: '', prev: null, next: null },
      },
    } as const;

    mockedApi.get.mockResolvedValueOnce(response);

    const result = await getEmployeeRatings({
      employeeId: 'employee-1',
      sourceType: 'project',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-16',
      page: 2,
      perPage: 5,
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/employees/employee-1/ratings', {
      params: {
        sourceType: 'project',
        dateFrom: '2026-07-01',
        dateTo: '2026-07-16',
        page: 2,
        perPage: 5,
      },
    });
    expect(mockedApi.get.mock.calls[0]?.[1]).not.toHaveProperty('headers');
    expect(result).toEqual(response.data);
  });
});
