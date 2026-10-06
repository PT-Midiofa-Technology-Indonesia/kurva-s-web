import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config';
import { render, screen, waitFor } from '@/shared/utils/test-utils';
import { FINANCE_REPORT_LABELS } from '../../constants';
import { FinanceReportListPage } from '../FinanceReportListPage';

const mockPush = vi.fn();
let lastReportRequest: Request | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () =>
    new URLSearchParams({
      companyId: 'company-1',
      search: 'PAY',
      source: 'purchase_order',
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
      type: 'cash_out',
    }),
}));

vi.mock('@/shared/hooks/use-company-filter', () => ({
  useCompanyFilter: () => ({
    companyId: 'company-1',
    companyOptions: [{ label: 'Company 01', value: 'company-1' }],
    handleCompanyChange: vi.fn(),
  }),
}));

const financeReportResponse = {
  success: true,
  data: {
    summary: {
      totalCashIn: 1_000_000,
      totalCashOut: 1_010_000,
      netBalance: -10_000,
    },
    items: [
      {
        id: 'report-1',
        code: 'PAY/KNS/2026/0004',
        source: 'purchase_order',
        sourceLabel: 'Purchase Order',
        reference: 'PO/2026/0001',
        amount: 100_000,
        transactionDate: '2026-06-01T05:08:00+07:00',
        type: 'cash_out',
        typeLabel: 'Cash Out',
      },
    ],
  },
  meta: {
    currentPage: 1,
    perPage: 10,
    total: 1,
    lastPage: 1,
    from: 1,
    to: 1,
  },
};

describe('FinanceReportListPage Integration', () => {
  beforeEach(() => {
    lastReportRequest = null;
    mockPush.mockClear();

    server.use(
      http.get(getApiPath('/finance/reports'), ({ request }) => {
        lastReportRequest = request;
        return HttpResponse.json(financeReportResponse);
      }),
      http.get(getApiPath('/enums/tax-resource-types'), () =>
        HttpResponse.json({
          success: true,
          data: [{ label: 'Purchase Order', value: 'purchase_order' }],
        })
      ),
      http.get(getApiPath('/enums/finance-report-types'), () =>
        HttpResponse.json({
          success: true,
          data: [{ label: 'Cash Out', value: 'cash_out' }],
        })
      )
    );
  });

  it('renders header above summary cards with company filter', async () => {
    render(<FinanceReportListPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: FINANCE_REPORT_LABELS.LIST.TITLE })
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Company 01')).toBeInTheDocument();
    expect(screen.getByText(FINANCE_REPORT_LABELS.LIST.SUMMARY.TOTAL_CASH_IN)).toBeInTheDocument();
  });

  it('renders search, source type, date range, and type filters', async () => {
    render(<FinanceReportListPage />);

    expect(
      await screen.findByPlaceholderText(FINANCE_REPORT_LABELS.LIST.SEARCH)
    ).toBeInTheDocument();
    const comboboxes = screen.getAllByRole('combobox');
    expect(within(comboboxes[0]).getByText('Company 01')).toBeInTheDocument();
    expect(
      within(comboboxes[1]).getByText(FINANCE_REPORT_LABELS.LIST.FILTERS.SOURCE_TYPE)
    ).toBeInTheDocument();
    expect(screen.getByText(/1 Jun 2026 - 30 Jun 2026/)).toBeInTheDocument();
    expect(
      screen.getAllByText(FINANCE_REPORT_LABELS.LIST.FILTERS.TYPE).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('fetches reports with X-Company-Id header and active filters', async () => {
    render(<FinanceReportListPage />);

    await waitFor(() => expect(lastReportRequest).not.toBeNull());
    const url = new URL(lastReportRequest!.url);

    expect(lastReportRequest!.headers.get('X-Company-Id')).toBe('company-1');
    expect(url.searchParams.get('search')).toBe('PAY');
    expect(url.searchParams.get('source')).toBe('purchase_order');
    expect(url.searchParams.get('dateFrom')).toBe('2026-06-01');
    expect(url.searchParams.get('dateTo')).toBe('2026-06-30');
    expect(url.searchParams.get('type')).toBe('cash_out');
  });

  it('navigates to detail page from action button', async () => {
    const user = userEvent.setup();
    render(<FinanceReportListPage />);

    const detailButton = await screen.findByTitle('Detail');
    await user.click(detailButton);

    expect(mockPush).toHaveBeenCalledWith('/finance/finance-report/report-1');
  });
});
