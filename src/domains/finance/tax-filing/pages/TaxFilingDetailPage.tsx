'use client';

import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ItemNotFound } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { Button } from '@/shared/components/ui';
import {
  TaxFilingAttachmentsCard,
  TaxFilingInformationCard,
  TaxFilingPaymentsCard,
  TaxFilingStatusBadge,
  TaxFilingSummaryCard,
  TaxFilingTransactionCard,
} from '../components/TaxFilingCards';
import { TaxFilingInformationDrawer, TaxFilingPaymentDrawer } from '../components/TaxFilingDrawers';
import { TAX_FILING_LABELS } from '../constants';
import { useTaxFilingDetailPage, useTaxFilingMutations } from '../hooks';

export function TaxFilingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const taxFilingId = id;
  const companyId = searchParams.get('companyId') ?? undefined;
  const { taxFiling, isLoading, isError, handleBack } = useTaxFilingDetailPage(
    taxFilingId,
    companyId
  );
  const mutations = useTaxFilingMutations(taxFilingId, companyId);
  const [paymentDrawer, setPaymentDrawer] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    paymentId?: string;
  }>({ isOpen: false, mode: 'add' });
  const [infoOpen, setInfoOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const selectedPayment = taxFiling?.payments?.find(
    (payment) => payment.id === paymentDrawer.paymentId
  );

  if (isLoading) return <FormPageSkeleton />;
  if (isError)
    return <ItemNotFound message={TAX_FILING_LABELS.DETAIL.LOAD_ERROR} onBack={handleBack} />;
  if (!taxFiling)
    return <ItemNotFound message={TAX_FILING_LABELS.DETAIL.NOT_FOUND} onBack={handleBack} />;
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            aria-label={TAX_FILING_LABELS.DETAIL.BACK}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-950">{taxFiling.code}</h1>
            <TaxFilingStatusBadge status={taxFiling.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>
      <TaxFilingSummaryCard taxFiling={taxFiling} />
      <TaxFilingTransactionCard taxFiling={taxFiling} />
      <TaxFilingPaymentsCard
        taxFiling={taxFiling}
        onAddPayment={() => setPaymentDrawer({ isOpen: true, mode: 'add' })}
        onViewPayment={(paymentId) => setPaymentDrawer({ isOpen: true, mode: 'view', paymentId })}
        onEditPayment={(paymentId) => setPaymentDrawer({ isOpen: true, mode: 'edit', paymentId })}
      />
      <TaxFilingInformationCard taxFiling={taxFiling} onSetInformation={() => setInfoOpen(true)} />
      <TaxFilingAttachmentsCard
        taxFiling={taxFiling}
        isUploading={mutations.uploadDocuments.isPending}
        uploadProgress={uploadProgress}
        onUpload={(files: File[]) => {
          if (files.length > 0) {
            setUploadProgress(0);
            mutations.uploadDocuments.mutate(
              { files, onUploadProgress: setUploadProgress },
              {
                onSuccess: () => setUploadProgress(null),
                onError: () => setUploadProgress(null),
              }
            );
          }
        }}
        onDelete={(documentId: string) => mutations.deleteDocument.mutate(documentId)}
      />
      <TaxFilingPaymentDrawer
        title={
          paymentDrawer.mode === 'view'
            ? 'Detail Payment'
            : paymentDrawer.mode === 'edit'
              ? TAX_FILING_LABELS.DETAIL.EDIT_PAYMENT
              : TAX_FILING_LABELS.DETAIL.ADD_PAYMENT
        }
        open={paymentDrawer.isOpen}
        onOpenChange={(open) => !open && setPaymentDrawer((prev) => ({ ...prev, isOpen: false }))}
        payment={selectedPayment}
        isReadOnly={paymentDrawer.mode === 'view'}
        isPending={mutations.createPayment.isPending || mutations.updatePayment.isPending}
        onSubmit={(payload) => {
          if (paymentDrawer.mode === 'edit' && paymentDrawer.paymentId)
            mutations.updatePayment.mutate(
              { paymentId: paymentDrawer.paymentId, payload },
              { onSuccess: () => setPaymentDrawer((prev) => ({ ...prev, isOpen: false })) }
            );
          else
            mutations.createPayment.mutate(payload, {
              onSuccess: () => setPaymentDrawer((prev) => ({ ...prev, isOpen: false })),
            });
        }}
      />
      <TaxFilingInformationDrawer
        open={infoOpen}
        onOpenChange={setInfoOpen}
        isPending={mutations.setInformation.isPending}
        information={taxFiling.information}
        onSubmit={(payload) => {
          mutations.setInformation.mutate(payload, { onSuccess: () => setInfoOpen(false) });
        }}
      />
    </div>
  );
}
