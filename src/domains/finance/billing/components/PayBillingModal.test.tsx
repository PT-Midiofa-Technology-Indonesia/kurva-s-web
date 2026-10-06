import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PayBillingModal } from './PayBillingModal';

const sharedModalSpy = vi.fn();

vi.mock('@/shared/components/molecules/PaymentExecutionModal', () => ({
  PaymentExecutionModal: (props: any) => {
    sharedModalSpy(props);
    return <div data-testid="shared-payment-modal" />;
  },
}));

vi.mock('../hooks/use-pay-billing', () => ({
  usePayBilling: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-billing-documents', () => ({
  useBillingDocuments: () => ({
    data: {
      data: {
        requirements: [
          {
            id: 'req-1',
            documentTypeId: 'doc-type-1',
            documentTypeCode: 'BILLING_PAYMENT_PROOF',
            documentTypeName: 'Bukti Pembayaran',
            allowedFileTypes: 'jpg,png,pdf',
            allowedFileSize: 5120,
            isMandatory: false,
            uploadedDocuments: [],
          },
        ],
      },
    },
    isLoading: false,
  }),
}));

vi.mock('../hooks/use-delete-billing-document', () => ({
  useDeleteBillingDocument: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/shared/hooks/use-enums', () => ({
  useBillingPaymentMethods: () => [],
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

describe('PayBillingModal', () => {
  it('uses shared payment execution modal with billing payload', () => {
    render(
      <PayBillingModal
        open
        companyId="company-1"
        requireProof
        onClose={vi.fn()}
        billing={{
          id: 'billing-1',
          code: 'BILL-001',
          companyId: 'company-1',
          projectId: 'project-1',
          billingType: 'progress',
          amount: 125000,
          status: 'invoiced',
          billedAt: '2026-08-24',
          dueDate: '2026-08-30',
          paidAt: null,
          paidBy: null,
          paymentMethod: null,
          clearedAt: null,
          clearedBy: null,
          checkNumber: null,
          checkIssueDate: null,
          checkEffectiveDate: null,
          notes: null,
          createdBy: 'user-1',
          isActive: true,
          createdAt: '2026-08-24T00:00:00Z',
          updatedAt: '2026-08-24T00:00:00Z',
          company: { id: 'company-1', name: 'Company 1' },
          project: { id: 'project-1', code: 'PRJ-001', name: 'Project 1' },
          createdByUser: { id: 'user-1', name: 'User 1' },
          progressItems: [],
          scheduleHistories: [],
        }}
      />
    );

    expect(screen.getByTestId('shared-payment-modal')).toBeInTheDocument();
    expect(sharedModalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        title: 'Bayar Billing',
        sourceCode: 'BILL-001',
        sourceTypeLabel: 'Billing',
        amount: 125000,
        openAmountEditable: true,
        requireProof: true,
        uploadHint: 'docx, xls, pdf, jpeg, jpg, png (max 5 files, up to 5MB each)',
        displayFiles: [],
        isLoadingFiles: false,
        isPending: false,
        onFileSelect: expect.any(Function),
        onRemoveFile: expect.any(Function),
        onSubmit: expect.any(Function),
      })
    );
  });
});
