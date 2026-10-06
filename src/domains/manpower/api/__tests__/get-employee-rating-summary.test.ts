import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { getEmployeeRatingSummary } from '../get-employee-rating-summary';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('getEmployeeRatingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the employee rating summary with showAll and no company header', async () => {
    const response = {
      data: {
        success: true,
        message: 'Data berhasil diambil.',
        data: {
          overallAvg: 4.15,
          totalRatings: 3,
          lastRatedAt: '2026-07-16T10:20:00+00:00',
          perCategory: [
            {
              categoryId: 'cat-1',
              categoryCode: 'capability',
              categoryName: 'Capability',
              avgScore: 4.33,
              count: 3,
              isActive: true,
            },
          ],
        },
      },
    } as const;

    mockedApi.get.mockResolvedValueOnce(response);

    const result = await getEmployeeRatingSummary({
      employeeId: 'employee-1',
      showAll: true,
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/employees/employee-1/ratings/summary', {
      params: {
        showAll: true,
      },
    });
    expect(mockedApi.get.mock.calls[0]?.[1]).not.toHaveProperty('headers');
    expect(result).toEqual(response.data);
  });
});
