import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { BillingCreatePage } from './BillingCreatePage';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '' }),
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-query-params', () => ({
  useQueryParams: () => ({
    queryParams: {
      companyId: 'company-1',
      projectId: '',
    },
  }),
}));

vi.mock('../hooks/use-billing', () => ({
  useBilling: () => ({ data: undefined }),
}));

vi.mock('../hooks/use-billing-detail', () => ({
  useBillingDetail: () => ({ data: undefined }),
}));

vi.mock('../hooks/use-save-billing-information', () => ({
  useSaveBillingInformation: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/use-update-billing-information', () => ({
  useUpdateBillingInformation: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/use-update-billing-progress', () => ({
  useUpdateBillingProgress: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/use-billing-progress', () => ({
  useBillingProgress: () => ({ data: undefined }),
}));

vi.mock('@/shared/components/molecules', () => ({
  PageHeader: ({ title }: any) => <div>{title}</div>,
  Stepper: ({ items, activeKey }: any) => (
    <div data-testid="stepper" data-active-key={activeKey}>
      {items.find((item: any) => item.key === activeKey)?.content}
    </div>
  ),
}));

vi.mock('../components/create-steps/Step1Info', () => ({
  Step1Info: () => <div>Step 1</div>,
}));

vi.mock('../components/create-steps/Step2Progress', () => ({
  Step2Progress: () => <div>Step 2</div>,
}));

vi.mock('../components/create-steps/Step3Document', () => ({
  Step3Document: () => <div>Step 3</div>,
}));

vi.mock('../components/create-steps/Step4Payment', () => ({
  Step4Payment: () => <div>Step 4</div>,
}));

describe('BillingCreatePage', () => {
  it('uses white background for create page container', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);

    const { container } = render(<BillingCreatePage />);
    const pageContainer = container.firstChild as HTMLElement;

    expect(pageContainer.className).toContain('bg-white');
  });
});
