import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PayModal } from './PayModal';

const sharedModalSpy = vi.fn();

vi.mock('@/shared/components/molecules/PaymentExecutionModal', () => ({
  PaymentExecutionModal: (props: any) => {
    sharedModalSpy(props);
    return <div data-testid="shared-payment-modal" />;
  },
}));

vi.mock('../hooks/use-pay-payment-request', () => ({
  usePayPaymentRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-delete-document', () => ({
  useDeleteDocument: () => ({ mutate: vi.fn() }),
}));

vi.mock('../hooks/use-payment-request-detail', () => ({
  usePaymentRequestDetail: () => ({
    data: {
      data: {
        documentRequirements: [],
      },
    },
    isLoading: false,
  }),
}));

vi.mock('@/shared/hooks/use-enums', () => ({
  usePaymentMethods: () => ({
    data: [
      { value: 'transfer', label: 'Transfer' },
      { value: 'giro', label: 'Giro' },
    ],
  }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

describe('PayModal', () => {
  it('uses shared payment execution modal with payment request payload', () => {
    render(
      <PayModal
        open
        paymentRequestId="payment-request-1"
        paymentRequestCode="PR-001"
        sourceType="purchase_order"
        sourceTypeLabel="Payment Request"
        amount={250000}
        companyId="company-1"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('shared-payment-modal')).toBeInTheDocument();
    expect(sharedModalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        sourceCode: 'PR-001',
        sourceTypeLabel: 'Payment Request',
        amount: 250000,
        openAmountEditable: true,
        requireProof: true,
      })
    );
  });

  it('keeps payment amount locked for non purchase order source', () => {
    render(
      <PayModal
        open
        paymentRequestId="payment-request-2"
        paymentRequestCode="PR-002"
        sourceType="cost_request"
        sourceTypeLabel="Cost Request"
        amount={125000}
        companyId="company-1"
        onClose={vi.fn()}
      />
    );

    expect(sharedModalSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sourceCode: 'PR-002',
        sourceTypeLabel: 'Cost Request',
        openAmountEditable: false,
      })
    );
  });
});
