import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/shared/utils/test-utils';
import { BILLING_LABELS } from '../../constants';
import { BillingCalendarPage } from '../BillingCalendarPage';

const mockPush = vi.fn();
const mockHandleCompanyChange = vi.fn();
const mockCalendarProps = vi.fn();
const mockUseCompanyFilter = vi.fn();
const mockUseBillingsCalendar = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/shared/hooks/use-company-filter', () => ({
  useCompanyFilter: () => mockUseCompanyFilter(),
}));

vi.mock('../../hooks', () => ({
  useBillingsCalendar: (params: unknown) => mockUseBillingsCalendar(params),
}));

vi.mock('@/shared/components/atoms', () => ({
  AsyncSelect: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="async-select">{placeholder ?? 'select'}</div>
  ),
}));

vi.mock('@/shared/components/molecules', () => ({
  Calendar: (props: Record<string, unknown>) => {
    mockCalendarProps(props);
    return <div data-testid="billing-calendar" />;
  },
}));

vi.mock('../../components/BillingCalendarDrawer', () => ({
  BillingCalendarDrawer: () => <div data-testid="billing-calendar-drawer" />,
}));

describe('BillingCalendarPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockHandleCompanyChange.mockReset();
    mockCalendarProps.mockReset();
    mockUseCompanyFilter.mockReset();
    mockUseBillingsCalendar.mockReset();

    mockUseCompanyFilter.mockReturnValue({
      companyId: 'company-1',
      companyOptions: [{ value: 'company-1', label: 'Company 1' }],
      handleCompanyChange: mockHandleCompanyChange,
    });

    mockUseBillingsCalendar.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders payment-request-like schedule header and calendar props', async () => {
    render(<BillingCalendarPage />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      BILLING_LABELS.CALENDAR.TITLE
    );
    expect(
      screen.getByRole('button', { name: BILLING_LABELS.CALENDAR.BACK_BUTTON })
    ).toBeInTheDocument();
    expect(screen.queryByText('Select Company')).not.toBeInTheDocument();

    expect(mockUseBillingsCalendar).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-1',
        year: expect.any(Number),
        date: expect.any(Number),
      })
    );

    expect(mockCalendarProps).toHaveBeenCalled();
    const props = mockCalendarProps.mock.calls[0][0] as Record<string, unknown>;

    expect(props.selectedDate).toBeNull();
    expect(props.showOutsideDays).toBe(true);
    expect(props.maxVisible).toBe(2);
    expect(props.labels).toMatchObject({
      today: BILLING_LABELS.CALENDAR.TODAY,
      more: BILLING_LABELS.CALENDAR.MORE,
    });
    expect(props.headerActions).toBeTruthy();
  });

  it('navigates back to billing list with company query preserved', async () => {
    const user = userEvent.setup();

    render(<BillingCalendarPage />);

    await user.click(screen.getByRole('button', { name: BILLING_LABELS.CALENDAR.BACK_BUTTON }));

    expect(mockPush).toHaveBeenCalledWith('/finance/billings?companyId=company-1');
  });
});
