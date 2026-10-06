import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { BillingListPage } from './BillingListPage';

const listPageTemplateSpy = vi.fn();

const mockBillingTypeOptions = [
  { value: 'progress', label: 'Progress' },
  { value: 'unit_price', label: 'Unit Price' },
];

const mockBillingStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'paid', label: 'Dibayar' },
];

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-query-params', () => ({
  useQueryParams: () => ({
    queryParams: {
      companyId: 'company-1',
      page: '1',
      perPage: '10',
    },
    setQueryParams: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/use-company-filter', () => ({
  useCompanyFilter: () => ({
    companyId: 'company-1',
    companyOptions: [{ value: 'company-1', label: 'Company 1' }],
    handleCompanyChange: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/use-enums', () => ({
  useBillingTypes: () => ({ data: mockBillingTypeOptions }),
  useBillingStatuses: () => ({ data: mockBillingStatusOptions }),
}));

vi.mock('../hooks', () => ({
  useBillingPage: () => ({
    billings: [],
    totalItems: 19,
    totalPages: 2,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../sections', () => ({
  BillingListFilters: ({ billingTypeOptions, billingStatusOptions }: any) => (
    <div>
      <div data-testid="billing-type-options">{JSON.stringify(billingTypeOptions)}</div>
      <div data-testid="billing-status-options">{JSON.stringify(billingStatusOptions)}</div>
    </div>
  ),
}));

vi.mock('@/shared/components/atoms', () => ({
  AsyncSelect: () => <div>Company Select</div>,
}));

vi.mock('@/shared/components/templates', () => ({
  ListPageTemplate: (props: any) => {
    listPageTemplateSpy(props);
    return <div>{props.toolbarRight}</div>;
  },
}));

vi.mock('../components', () => ({
  StatusBadge: () => <div>Status Badge</div>,
}));

describe('BillingListPage', () => {
  it('uses billing type and status options from enum hooks', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    render(<BillingListPage />);

    expect(screen.getByTestId('billing-type-options')).toHaveTextContent(
      JSON.stringify(mockBillingTypeOptions)
    );
    expect(screen.getByTestId('billing-status-options')).toHaveTextContent(
      JSON.stringify(mockBillingStatusOptions)
    );
  });

  it('passes total pages and perPage pagination props to list template', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    render(<BillingListPage />);

    expect(listPageTemplateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        perPage: 10,
        totalItems: 19,
        totalPages: 2,
      })
    );
  });
});
