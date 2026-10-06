'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { ItemNotFound } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { CancelConfirmDialog } from '../components/CancelConfirmDialog';
import { EditDueDateModal } from '../components/EditDueDateModal';
import { PayModal } from '../components/PayModal';
import {
  GeneralInformationCard,
  getPaymentRequestReferenceHref,
  PaymentEventsCard,
  PaymentSummaryCard,
  type ProofDocument,
  ProofPaymentDialog,
  SourceItemsCard,
} from '../components/PaymentRequestDetailSections';
import { SupportingDocumentsCard } from '../components/SupportingDocumentsModal';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { useCancelPaymentRequest } from '../hooks/use-cancel-payment-request';
import { usePaymentRequestDetailPage } from '../hooks/use-payment-request-detail-page';
import { PAYMENT_REQUEST_QUERY_KEYS } from '../hooks/use-payment-requests';

const labels = PAYMENT_REQUEST_LABELS.DETAIL;

function getBlockedPaymentMessage(message?: string | null) {
  return message?.trim() || labels.PRE_PAY_CHECK_DEFAULT_MESSAGE;
}

export function PaymentRequestDetailPage() {
  const params = useParams<Record<string, string>>();
  const searchParams = useSearchParams();
  const selectedCompanyId = useSelectedCompanyStore((state) => state.selectedCompanyId);
  const paymentRequestId = params.id ?? '';
  const companyId = searchParams.get('companyId') ?? selectedCompanyId ?? undefined;
  const queryClient = useQueryClient();
  const { paymentRequest, prePayCheck, isLoading, handleBack } = usePaymentRequestDetailPage(
    paymentRequestId,
    companyId
  );
  const { mutateAsync: cancelMutation, isPending: isCancelPending } =
    useCancelPaymentRequest(paymentRequestId);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [editDueDateOpen, setEditDueDateOpen] = useState(false);
  const [proofDialogOpen, setProofDialogOpen] = useState(false);
  const [activeProofDocument, setActiveProofDocument] = useState<ProofDocument | null>(null);

  const handlePaySuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PAYMENT_REQUEST_QUERY_KEYS.all });
  }, [queryClient]);

  const handleConfirmCancel = useCallback(async () => {
    try {
      await cancelMutation();
      toast.success({ title: 'Payment request dibatalkan' });
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: PAYMENT_REQUEST_QUERY_KEYS.all });
    } catch (error: any) {
      toast.error({
        title: 'Gagal membatalkan',
        description: error?.message || 'Terjadi kesalahan',
      });
    }
  }, [cancelMutation, queryClient]);

  const modalAmount = useMemo(() => {
    if (!paymentRequest) return 0;
    return paymentRequest.remainingAmount ?? paymentRequest.amount;
  }, [paymentRequest]);

  if (isLoading) return <FormPageSkeleton />;
  if (!paymentRequest) return <ItemNotFound message={labels.NOT_FOUND} onBack={handleBack} />;

  const requestProofDocument =
    paymentRequest.documentRequirements
      ?.flatMap((requirement) => requirement.uploadedDocuments)
      .at(0) ?? null;
  const referenceHref = getPaymentRequestReferenceHref(paymentRequest);
  const referenceUrl =
    referenceHref && companyId
      ? `${referenceHref}?companyId=${encodeURIComponent(companyId)}`
      : referenceHref;
  const canShowPayAction = prePayCheck?.canPay ?? false;
  const shouldHideActions = paymentRequest.isNeedApproval === true;
  const paymentBlockedMessage = getBlockedPaymentMessage(prePayCheck?.message);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">
            {paymentRequest.source?.code ?? paymentRequest.code}
          </h1>
        </div>
        {requestProofDocument && (
          <Button
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
            onClick={() => {
              setActiveProofDocument(requestProofDocument);
              setProofDialogOpen(true);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            {labels.PROOF_PAYMENT}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GeneralInformationCard
          paymentRequest={paymentRequest}
          onEditDueDate={() => setEditDueDateOpen(true)}
          onOpenReference={
            referenceUrl
              ? () => window.open(referenceUrl, '_blank', 'noopener,noreferrer')
              : undefined
          }
        />
        <PaymentSummaryCard
          paymentRequest={paymentRequest}
          onPay={() => setPayModalOpen(true)}
          onCancel={() => setCancelDialogOpen(true)}
          isCancelPending={isCancelPending}
          canShowPayAction={canShowPayAction}
          shouldHideActions={shouldHideActions}
          blockedMessage={paymentBlockedMessage}
        />
      </div>

      {paymentRequest.source.items.length > 0 && (
        <SourceItemsCard paymentRequest={paymentRequest} />
      )}
      <SupportingDocumentsCard
        paymentRequestId={paymentRequest.id}
        documents={paymentRequest.supportingDocuments ?? []}
      />
      <PaymentEventsCard
        events={paymentRequest.paymentRequestEvents}
        onOpenProof={(document) => {
          setActiveProofDocument(document);
          setProofDialogOpen(true);
        }}
      />

      <PayModal
        open={payModalOpen}
        paymentRequestId={paymentRequest.id}
        paymentRequestCode={paymentRequest.source.code}
        sourceType={paymentRequest.sourceType}
        sourceTypeLabel={paymentRequest.sourceTypeLabel}
        amount={modalAmount}
        companyId={companyId}
        onClose={() => setPayModalOpen(false)}
        onSuccess={handlePaySuccess}
      />

      <CancelConfirmDialog
        open={cancelDialogOpen}
        paymentRequestCode={paymentRequest.source.code}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
      <EditDueDateModal
        open={editDueDateOpen}
        onClose={() => setEditDueDateOpen(false)}
        paymentRequestId={paymentRequest.id}
        initialDate={paymentRequest.dueDate}
      />
      <ProofPaymentDialog
        open={proofDialogOpen}
        onClose={() => setProofDialogOpen(false)}
        document={activeProofDocument}
      />
    </div>
  );
}
