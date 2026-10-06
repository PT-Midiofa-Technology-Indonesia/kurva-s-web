import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PaymentRequestDetail } from '../types';
import { PaymentSummaryCard } from './PaymentRequestDetailSections';

vi.mock('@/shared/components/organisms', () => ({
  DataTable: () => <div data-testid="data-table" />,
}));

function createPaymentRequestDetail(
  overrides: Partial<PaymentRequestDetail> = {}
): PaymentRequestDetail {
  return {
    id: 'payment-request-1',
    code: 'PR-001',
    companyId: 'company-1',
    companyName: 'Company A',
    company: {
      id: 'company-1',
      name: 'Company A',
    },
    sourceType: 'purchase_order',
    sourceTypeLabel: 'Purchase Order',
    sourceId: 'source-1',
    amount: 100000000,
    dueDate: '2026-08-31T00:00:00.000Z',
    status: 'pending',
    statusLabel: 'Pending',
    paidAmount: 30000000,
    remainingAmount: 70000000,
    totalAmount: 100000000,
    notes: null,
    canPay: true,
    canCancel: true,
    isReadOnly: false,
    source: {
      id: 'source-1',
      code: 'SRC-001',
      totalAmount: 100000000,
      paymentMethod: null,
      paymentMethodLabel: null,
      items: [],
    },
    createdAt: '2026-08-31T00:00:00.000Z',
    updatedAt: '2026-08-31T00:00:00.000Z',
    paymentRequestEvents: [],
    ...overrides,
  };
}

describe('PaymentSummaryCard', () => {
  it('shows approval warning and hides actions when approval is still needed', () => {
    render(
      <PaymentSummaryCard
        paymentRequest={createPaymentRequestDetail({ isNeedApproval: true })}
        onPay={vi.fn()}
        onCancel={vi.fn()}
        isCancelPending={false}
        canShowPayAction={true}
        shouldHideActions={true}
        blockedMessage="blocked by pre pay check"
      />
    );

    expect(
      screen.getByText(
        'Payment will be processed after receiving approval from the authorized approver.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay Now' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel Payment' })).not.toBeInTheDocument();
  });

  it('shows pre pay check warning and hides pay button when canPay is false', () => {
    render(
      <PaymentSummaryCard
        paymentRequest={createPaymentRequestDetail({ status: 'pending' })}
        onPay={vi.fn()}
        onCancel={vi.fn()}
        isCancelPending={false}
        canShowPayAction={false}
        shouldHideActions={false}
        blockedMessage="Dokumen berikut wajib di-upload sebelum bayar: Dokumen Payment Request PO."
      />
    );

    expect(
      screen.getByText('Dokumen berikut wajib di-upload sebelum bayar: Dokumen Payment Request PO.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay Now' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel Payment' })).toBeInTheDocument();
  });

  it('shows pay and cancel actions when approval not needed and pre pay passes', () => {
    render(
      <PaymentSummaryCard
        paymentRequest={createPaymentRequestDetail({ status: 'partial_paid' })}
        onPay={vi.fn()}
        onCancel={vi.fn()}
        isCancelPending={false}
        canShowPayAction={true}
        shouldHideActions={false}
        blockedMessage=""
      />
    );

    expect(screen.getByRole('button', { name: 'Pay Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel Payment' })).toBeInTheDocument();
  });
});
