'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { PaymentExecutionFormValues } from '@/shared/components/molecules';
import {
  PaymentExecutionModal,
  type PaymentExecutionModalFile,
} from '@/shared/components/molecules';
import { usePaymentMethods } from '@/shared/hooks/use-enums';
import { toast } from '@/shared/lib/toast';
import { formatFileSize } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { useDeleteDocument } from '../hooks/use-delete-document';
import { usePayPaymentRequest } from '../hooks/use-pay-payment-request';
import { usePaymentRequestDetail } from '../hooks/use-payment-request-detail';
import { PAYMENT_REQUEST_QUERY_KEYS } from '../hooks/use-payment-requests';
import type { PaymentRequestDocumentRequirement, PaymentRequestUploadedDocument } from '../types';

const labels = PAYMENT_REQUEST_LABELS.PAY_MODAL;

interface PayModalProps {
  open: boolean;
  paymentRequestId: string;
  paymentRequestCode: string;
  sourceType?: string;
  sourceTypeLabel?: string;
  amount: number;
  companyId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DisplayFile extends PaymentExecutionModalFile {
  requirementId: string;
  documentId?: string;
  isLocal: boolean;
}

function normalizeUploadedDoc(doc: any): PaymentRequestUploadedDocument | null {
  if (!doc) return null;
  return {
    id: String(doc.id ?? ''),
    fileName: String(doc.fileName ?? doc.name ?? doc.filename ?? ''),
    fileSize: Number(doc.fileSize ?? doc.size ?? 0),
    url: String(doc.url ?? doc.fileUrl ?? ''),
    createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
  };
}

function getUploadedFiles(
  documentRequirements: PaymentRequestDocumentRequirement[],
  localFiles: Record<string, File | null>
): DisplayFile[] {
  const displayFiles: DisplayFile[] = [];

  for (const requirement of documentRequirements) {
    const localFile = localFiles[requirement.id];
    if (localFile) {
      displayFiles.push({
        key: `${requirement.id}-${localFile.name}`,
        requirementId: requirement.id,
        name: localFile.name,
        size: localFile.size,
        url: URL.createObjectURL(localFile),
        isLocal: true,
      });
      continue;
    }

    const rawDocs = requirement.uploadedDocuments ?? [];
    const docList = Array.isArray(rawDocs) ? rawDocs : [rawDocs];

    for (const rawDoc of docList) {
      const document = normalizeUploadedDoc(rawDoc);
      if (!document?.id) continue;

      displayFiles.push({
        key: `${requirement.id}-${document.id}`,
        requirementId: requirement.id,
        documentId: document.id,
        name: document.fileName,
        size: document.fileSize,
        url: document.url,
        isLocal: false,
      });
    }
  }

  return displayFiles;
}

export function PayModal({
  open,
  paymentRequestId,
  paymentRequestCode,
  sourceType,
  sourceTypeLabel = 'Payment Request',
  amount,
  companyId,
  onClose,
  onSuccess,
}: PayModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: payMutation, isPending } = usePayPaymentRequest(paymentRequestId);
  const { mutate: deleteMutation } = useDeleteDocument(paymentRequestId);
  const { data: detailData, isLoading: isLoadingDetail } = usePaymentRequestDetail({
    id: paymentRequestId,
    companyId,
  });
  const { data: paymentMethods = [] } = usePaymentMethods();

  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>({});

  const documentRequirements = detailData?.data?.documentRequirements ?? [];
  const firstRequirement = documentRequirements[0] ?? null;
  const displayFiles = useMemo(
    () => getUploadedFiles(documentRequirements, localFiles),
    [documentRequirements, localFiles]
  );
  const hasUploadedProof = documentRequirements.some(
    (requirement) => (requirement.uploadedDocuments ?? []).length > 0
  );
  const hasAnyProof = displayFiles.length > 0 || hasUploadedProof;

  const uploadHint = firstRequirement?.allowedFileTypes
    ? `${firstRequirement.allowedFileTypes} (max 5 files, up to ${
        firstRequirement.allowedMaxSize != null
          ? formatFileSize(firstRequirement.allowedMaxSize * 1024)
          : '5MB'
      } each)`
    : 'docx, xls, pdf, jpeg, jpg, png (max 5 files, up to 5MB each)';
  const isPurchaseOrder = sourceType === 'purchase_order';

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

    deleteMutation(currentFile.documentId, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: PAYMENT_REQUEST_QUERY_KEYS.detail(paymentRequestId),
        });
      },
    });
  };

  const handleSubmit = async (values: PaymentExecutionFormValues) => {
    try {
      if (!hasAnyProof) {
        toast.error({
          title: labels.PAYMENT_PROOF_REQUIRED,
          description: labels.PAYMENT_PROOF_REQUIRED_DESC,
        });
        return;
      }

      const mandatoryDocs = documentRequirements.filter((requirement) => requirement.isMandatory);
      const allMandatoryUploaded = mandatoryDocs.every((requirement) => {
        const hasSelectedLocalFile = Boolean(localFiles[requirement.id]);
        const uploadedDocuments = requirement.uploadedDocuments ?? [];
        return hasSelectedLocalFile || uploadedDocuments.length > 0;
      });

      if (!allMandatoryUploaded) {
        toast.error({
          title: labels.MANDATORY_DOCS_INCOMPLETE,
          description: labels.MANDATORY_DOCS_INCOMPLETE_DESC,
        });
        return;
      }

      const isTransfer = values.paymentMethod === 'transfer';
      const isGiro = values.paymentMethod === 'giro';

      await payMutation({
        amount: values.amount,
        paymentDate: values.paymentDate?.toISOString() ?? new Date().toISOString(),
        paymentMethod: values.paymentMethod,
        transferVia: isTransfer ? values.transferVia?.trim() : undefined,
        checkNumber: isGiro ? values.checkNumber?.trim() : undefined,
        checkIssueDate:
          isGiro && values.checkIssueDate ? values.checkIssueDate.toISOString() : undefined,
        checkEffectiveDate:
          isGiro && values.checkEffectiveDate ? values.checkEffectiveDate.toISOString() : undefined,
        notes: values.notes?.trim() || undefined,
        documentTypeId: firstRequirement?.documentTypeId,
        file: firstRequirement ? (localFiles[firstRequirement.id] ?? undefined) : undefined,
      });

      toast.success({
        title: labels.PAY_SUCCESS,
        description: `Payment Request ${paymentRequestCode} ${labels.PAY_SUCCESS_DESC}`,
      });

      queryClient.invalidateQueries({ queryKey: PAYMENT_REQUEST_QUERY_KEYS.all });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error({
        title: labels.PAY_FAILED,
        description: error?.message || 'Terjadi kesalahan',
      });
    }
  };

  return (
    <PaymentExecutionModal
      open={open}
      sourceTypeLabel={sourceTypeLabel}
      sourceCode={paymentRequestCode}
      amount={amount}
      labels={{
        title: labels.TITLE,
        submit: labels.SUBMIT,
        processing: labels.PROCESSING,
        cancel: labels.CANCEL,
        paymentDate: labels.PAYMENT_DATE,
        paymentMethod: labels.PAYMENT_METHOD,
        paymentAmount: labels.PAYMENT_AMOUNT,
        totalAmount: labels.TOTAL_AMOUNT,
        transferVia: labels.TRANSFER_VIA,
        transferViaPlaceholder: labels.TRANSFER_VIA_PLACEHOLDER,
        checkNumber: labels.CHECK_NUMBER,
        checkNumberPlaceholder: labels.CHECK_NUMBER_PLACEHOLDER,
        checkIssueDate: labels.CHECK_ISSUE_DATE,
        checkEffectiveDate: labels.CHECK_EFFECTIVE_DATE,
        notes: labels.NOTES,
        notesPlaceholder: labels.NOTES_PLACEHOLDER,
        paymentProof: labels.PAYMENT_PROOF,
        dragDrop: labels.DRAG_DROP,
        browseFiles: labels.BROWSE_FILES,
        removeFile: labels.REMOVE_FILE,
      }}
      paymentMethodOptions={paymentMethods}
      openAmountEditable={isPurchaseOrder}
      requireProof
      uploadHint={uploadHint}
      displayFiles={displayFiles}
      isLoadingFiles={isLoadingDetail}
      isPending={isPending}
      onClose={onClose}
      onFileSelect={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onSubmit={handleSubmit}
    />
  );
}

export { normalizeUploadedDoc };
