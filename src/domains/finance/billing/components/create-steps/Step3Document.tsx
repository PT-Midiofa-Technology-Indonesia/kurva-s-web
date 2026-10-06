'use client';

import { Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { formatFileSize } from '@/shared/utils/format';
import { BILLING_LABELS } from '../../constants';
import { useBillingDocuments } from '../../hooks/use-billing-documents';
import { useDeleteBillingDocument } from '../../hooks/use-delete-billing-document';
import { useUploadBillingDocument } from '../../hooks/use-upload-billing-document';
import type {
  BillingDocumentRequirement,
  BillingProjectDetail,
  BillingUploadedDocument,
} from '../../types';

type Step3DocumentProps = {
  billingDetail?: BillingProjectDetail;
  billingId?: string | null;
  companyId?: string;
  handleNext: () => void;
  handleBack: () => void;
};

function DocumentCard({
  requirement,
  billingId,
  companyId,
  onRefetch,
}: {
  requirement: BillingDocumentRequirement;
  billingId: string;
  companyId: string;
  onRefetch: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { mutate: uploadDocument, isPending: isUploading } = useUploadBillingDocument();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteBillingDocument();

  const isProcessing = isUploading || isDeleting;
  const isUploaded = requirement.isUploaded ?? requirement.uploadedDocuments.length > 0;
  const helperText =
    requirement.allowedFileTypes || requirement.allowedFileSize
      ? `${requirement.allowedFileTypes || 'Pdf/Doc'}${requirement.allowedFileTypes && requirement.allowedFileSize ? ',' : ''}${requirement.allowedFileSize != null ? `maks ${formatFileSize(requirement.allowedFileSize * 1024)}` : ''}`
      : 'Pdf/Doc,maks 5 MB';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    uploadDocument(
      {
        billingId,
        companyId,
        documentTypeId: requirement.documentTypeId,
        files: [file],
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Dokumen berhasil diunggah' });
          onRefetch();
        },
        onError: () => {
          toast.error({ title: 'Gagal mengunggah dokumen' });
        },
      }
    );
  };

  const handleDelete = (document: BillingUploadedDocument) => {
    setDeletingId(document.id);
    deleteDocument(
      {
        billingId,
        documentId: document.id,
        companyId,
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Dokumen berhasil dihapus' });
          setDeletingId(null);
          onRefetch();
        },
        onError: () => {
          toast.error({ title: 'Gagal menghapus dokumen' });
          setDeletingId(null);
        },
      }
    );
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {requirement.documentTypeName}
            {requirement.isMandatory ? <span className="text-red-500">*</span> : null}
          </p>
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            isUploaded ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600',
          ].join(' ')}
        >
          {isUploaded ? 'Terunggah' : 'Belum diunggah'}
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden
        />
      </div>

      {requirement.uploadedDocuments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {requirement.uploadedDocuments.map((document) => (
            <div
              key={document.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-blue-600">{document.fileName}</p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(document.fileSize ?? undefined)}
                </p>
              </div>
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-slate-500 hover:text-slate-700"
                aria-label="Download file"
              >
                <Download size={16} />
              </a>
              {deletingId === document.id ? (
                <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" />
              ) : (
                <button
                  type="button"
                  className="shrink-0 text-slate-500 hover:text-slate-700 disabled:opacity-40"
                  onClick={() => handleDelete(document)}
                  disabled={isProcessing}
                  aria-label="Hapus file"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isProcessing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center disabled:opacity-60"
      >
        <Upload size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-blue-600">Klik untuk Upload</span>
        <span className="text-sm text-slate-400">atau seret file kesini - {helperText}</span>
      </button>

      {isUploading && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-3/5 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
          <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" />
        </div>
      )}
    </div>
  );
}

export function Step3Document({
  billingId,
  companyId,
  handleNext,
  handleBack,
}: Step3DocumentProps) {
  const { data, isLoading, refetch } = useBillingDocuments({
    billingId: billingId ?? '',
    companyId,
  });

  const requirements = data?.data?.requirements ?? [];
  const requiredRequirements = requirements.filter((item) => item.isMandatory);
  const optionalRequirements = requirements.filter((item) => !item.isMandatory);
  const canContinue = data?.data?.isAllMandatoryUploaded ?? false;
  const disabled = !billingId || !companyId;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          {BILLING_LABELS.CREATE.DOCUMENT_REQUIRED}
        </h3>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Memuat dokumen...
          </div>
        ) : requiredRequirements.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Belum ada dokumen wajib.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {requiredRequirements.map((item) => (
              <DocumentCard
                key={item.id}
                requirement={item}
                billingId={billingId ?? ''}
                companyId={companyId ?? ''}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          {BILLING_LABELS.CREATE.DOCUMENT_OPTIONAL}
        </h3>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Memuat dokumen...
          </div>
        ) : optionalRequirements.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Belum ada dokumen opsional.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {optionalRequirements.map((item) => (
              <DocumentCard
                key={item.id}
                requirement={item}
                billingId={billingId ?? ''}
                companyId={companyId ?? ''}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={handleBack}>
          {BILLING_LABELS.CREATE.CANCEL}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-teal-600 text-white hover:bg-teal-700"
          disabled={disabled || !canContinue}
        >
          {BILLING_LABELS.CREATE.SAVE_CONTINUE}
        </Button>
      </div>
    </div>
  );
}
