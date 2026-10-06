'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type PaymentExecutionFormValues,
  PaymentExecutionModal,
  type PaymentExecutionModalFile,
} from '@/shared/components/molecules';
import { useBillingPaymentMethods } from '@/shared/hooks/use-enums';
import { toast } from '@/shared/lib/toast';
import { formatFileSize } from '@/shared/utils/format';
import { BILLING_MODAL_LABELS } from '../constants';
import { BILLINGS_QUERY_KEYS } from '../hooks/use-billings';
import { useDeleteBillingDocument } from '../hooks/use-delete-billing-document';
import { usePayBilling } from '../hooks/use-pay-billing';
import type {
  Billing,
  BillingDocumentRequirement,
  BillingProjectDocumentRequirement,
} from '../types';

type DocumentRequirementInput = BillingProjectDocumentRequirement | BillingDocumentRequirement;

interface PayBillingModalProps {
  open: boolean;
  billing: Billing | null;
  companyId: string;
  requireProof?: boolean;
  documentRequirements?: DocumentRequirementInput[];
  onClose: () => void;
}

interface DisplayFile extends PaymentExecutionModalFile {
  requirementId: string;
  documentId?: string;
  isLocal: boolean;
}

const labels = BILLING_MODAL_LABELS;

function getDisplayFiles(
  documentRequirements: DocumentRequirementInput[],
  localFiles: Record<string, File | null>
): DisplayFile[] {
  const displayFiles: DisplayFile[] = [];

  for (const requirement of documentRequirements) {
    const localFile = localFiles[requirement.id];
    if (!localFile) continue;

    displayFiles.push({
      key: `${requirement.id}-${localFile.name}`,
      requirementId: requirement.id,
      name: localFile.name,
      size: localFile.size,
      url: URL.createObjectURL(localFile),
      isLocal: true,
    });
  }

  return displayFiles;
}

export function PayBillingModal({
  open,
  billing,
  companyId,
  requireProof = false,
  documentRequirements = [],
  onClose,
}: PayBillingModalProps) {
  const queryClient = useQueryClient();
  const { mutate: payBilling, isPending } = usePayBilling();
  const { mutate: deleteDocument } = useDeleteBillingDocument();
  const { data: billingPaymentMethods = [] } = useBillingPaymentMethods();
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});

  const isLoadingFiles = false;
  const firstRequirement = documentRequirements[0] ?? null;
  const displayFiles = getDisplayFiles(documentRequirements, localFiles);

  if (!billing) return null;

  const maxSize =
    firstRequirement && 'allowedMaxSize' in firstRequirement
      ? firstRequirement.allowedMaxSize
      : firstRequirement?.allowedFileSize;

  const uploadHint = firstRequirement?.allowedFileTypes
    ? `${firstRequirement.allowedFileTypes} (max 5 files, up to ${
        maxSize != null ? formatFileSize(maxSize * 1024) : '5MB'
      } each)`
    : 'docx, xls, pdf, jpeg, jpg, png (max 5 files, up to 5MB each)';

  const handleFileSelect = (file: File) => {
    if (!firstRequirement) return;
    setLocalFiles((prev) => ({ ...prev, [firstRequirement.id]: file }));
  };

  const handleRemoveFile = (file: PaymentExecutionModalFile) => {
    const currentFile = file as DisplayFile;

    if (currentFile.isLocal) {
      setLocalFiles((prev) => ({ ...prev, [currentFile.requirementId]: null }));
      return;
    }

    if (!currentFile.documentId) return;

    deleteDocument(
      {
        billingId: billing.id,
        documentId: currentFile.documentId,
        companyId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: BILLINGS_QUERY_KEYS.documents(billing.id, companyId),
          });
        },
      }
    );
  };

  const handleSubmit = (values: PaymentExecutionFormValues) => {
    payBilling(
      {
        billingId: billing.id,
        companyId,
        paidAt: values.paymentDate?.toISOString() ?? new Date().toISOString(),
        amount: values.amount,
        paymentMethod: values.paymentMethod === 'giro' ? 'check' : values.paymentMethod,
        transferVia:
          values.paymentMethod === 'transfer' ? values.transferVia?.trim() || undefined : undefined,
        notes: values.notes?.trim() || undefined,
        documentTypeId: firstRequirement?.documentTypeId,
        file: firstRequirement ? (localFiles[firstRequirement.id] ?? undefined) : undefined,
        ...(values.paymentMethod === 'giro'
          ? {
              checkNumber: values.checkNumber?.trim() || undefined,
              checkIssueDate: values.checkIssueDate?.toISOString(),
              checkEffectiveDate: values.checkEffectiveDate?.toISOString(),
            }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Billing berhasil dibayar' });
          setLocalFiles({});
          onClose();
        },
        onError: () => {
          toast.error({ title: 'Gagal memproses pembayaran' });
        },
      }
    );
  };

  return (
    <PaymentExecutionModal
      open={open}
      title={labels.PAY_TITLE}
      sourceTypeLabel="Billing"
      sourceCode={billing.code}
      amount={billing.amountAfterTax ?? billing.amount ?? 0}
      labels={{
        title: labels.PAY_TITLE,
        submit: labels.BUTTONS.PAY,
        processing: labels.BUTTONS.PROCESSING,
        cancel: labels.BUTTONS.CANCEL,
        paymentDate: labels.PAY_FIELDS.PAID_AT,
        paymentMethod: labels.PAY_FIELDS.PAYMENT_METHOD,
        paymentAmount: 'Jumlah Pembayaran',
        totalAmount: 'Total Tagihan',
        transferVia: 'Transfer Via',
        transferViaPlaceholder: 'Masukkan transfer via',
        checkNumber: labels.PAY_FIELDS.CHECK_NUMBER,
        checkNumberPlaceholder: labels.PAY_PLACEHOLDERS.CHECK_NUMBER,
        checkIssueDate: labels.PAY_FIELDS.CHECK_ISSUE_DATE,
        checkEffectiveDate: labels.PAY_FIELDS.CHECK_EFFECTIVE_DATE,
        notes: labels.PAY_FIELDS.NOTES,
        notesPlaceholder: labels.PAY_PLACEHOLDERS.NOTES,
        paymentProof: 'Bukti Pembayaran',
        dragDrop: 'Drag & drop files here',
        browseFiles: 'Browse files',
        removeFile: 'Remove file',
      }}
      paymentMethodOptions={billingPaymentMethods}
      openAmountEditable
      requireProof={requireProof}
      uploadHint={uploadHint}
      displayFiles={displayFiles}
      isLoadingFiles={isLoadingFiles}
      isPending={isPending}
      onClose={onClose}
      onFileSelect={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onSubmit={handleSubmit}
    />
  );
}
