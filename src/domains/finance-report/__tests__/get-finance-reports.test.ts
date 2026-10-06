import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFinanceReports } from '../api/get-finance-reports';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/shared/lib/api-config', () => ({
  getApiPath: (path: string) => `/v1${path}`,
}));

const { default: mockAxios } = await import('@/shared/lib/axios');

const response = {
  success: true,
  data: {
    summary: {
      totalCashIn: 1000,
      totalCashOut: 500,
      netBalance: 500,
    },
    items: [],
  },
  meta: {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    from: 0,
    to: 0,
  },
};

describe('getFinanceReports', () => {
  beforeEach(() => {
    vi.mocked(mockAxios.get).mockReset();
  });

  it('passes search and filters as query params', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({ data: response });

    await getFinanceReports({
      companyId: 'company-1',
      page: 2,
      perPage: 20,
      search: 'PAY',
      source: 'purchase_order',
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
      type: 'cash_out',
    });

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/finance/reports',
      expect.objectContaining({
        params: {
          page: 2,
          perPage: 20,
          search: 'PAY',
          source: 'purchase_order',
          dateFrom: '2026-06-01',
          dateTo: '2026-06-30',
          type: 'cash_out',
        },
      })
    );
  });

  it('sends X-Company-Id header and omits companyId from query params', async () => {
    vi.mocked(mockAxios.get).mockResolvedValueOnce({ data: response });

    await getFinanceReports({ companyId: 'company-1', search: 'PAY' });

    expect(mockAxios.get).toHaveBeenCalledWith(
      '/v1/finance/reports',
      expect.objectContaining({
        headers: { 'X-Company-Id': 'company-1' },
        params: { search: 'PAY' },
      })
    );
  });
});
