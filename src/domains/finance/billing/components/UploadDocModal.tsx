'use client';

import { Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { toast } from '@/shared/lib/toast';
import { formatFileSize } from '@/shared/utils/format';
import { BILLING_MODAL_LABELS } from '../constants';
import { useBillingDocuments } from '../hooks/use-billing-documents';
import { useDeleteBillingDocument } from '../hooks/use-delete-billing-document';
import { useUploadBillingDocument } from '../hooks/use-upload-billing-document';
import type { BillingDocumentRequirement, BillingUploadedDocument } from '../types';

interface UploadDocModalProps {
  open: boolean;
  billingId: string;
  companyId: string;
  onClose: () => void;
}

interface DocRowProps {
  req: BillingDocumentRequirement;
  billingId: string;
  companyId: string;
  onRefetch: () => void;
}

function DocRow({ req, billingId, companyId, onRefetch }: DocRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { mutate: uploadDocument, isPending: isUploading } = useUploadBillingDocument();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteBillingDocument();

  const isProcessing = isUploading || isDeleting;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    uploadDocument(
      { billingId, companyId, documentTypeId: req.documentTypeId, files: [file] },
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

  const handleDelete = (doc: BillingUploadedDocument) => {
    setUploadingId(doc.id);
    deleteDocument(
      { billingId, documentId: doc.id, companyId },
      {
        onSuccess: () => {
          toast.success({ title: 'Dokumen berhasil dihapus' });
          setUploadingId(null);
          onRefetch();
        },
        onError: () => {
          toast.error({ title: 'Gagal menghapus dokumen' });
          setUploadingId(null);
        },
      }
    );
  };

  return (
    <div className="py-4">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-700">
            {req.documentTypeName}
            {req.isMandatory && <span className="text-primary"> *</span>}
          </span>
          {(req.allowedFileTypes || req.allowedFileSize) && (
            <p className="mt-0.5 text-xs text-slate-400">
              {req.allowedFileTypes}
              {req.allowedFileTypes && req.allowedFileSize ? ' | ' : ''}
              {req.allowedFileSize != null && `Max ${formatFileSize(req.allowedFileSize * 1024)}`}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
        >
          <Upload size={14} />
          {req.uploadedDocuments.length > 0
            ? BILLING_MODAL_LABELS.DOCUMENTS.REPLACE
            : BILLING_MODAL_LABELS.DOCUMENTS.BROWSE}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden
        />
      </div>

      {/* Uploaded files */}
      {req.uploadedDocuments.map((doc) => (
        <div key={doc.id} className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
              <FileText size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{doc.fileName}</p>
              <p className="text-xs text-slate-400">{formatFileSize(doc.fileSize ?? undefined)}</p>
            </div>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-cyan-500 hover:text-cyan-600"
              aria-label={BILLING_MODAL_LABELS.DOCUMENTS.DOWNLOAD}
            >
              <Download size={18} />
            </a>
            {uploadingId === doc.id ? (
              <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" />
            ) : (
              <button
                type="button"
                className="shrink-0 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                aria-label={BILLING_MODAL_LABELS.DOCUMENTS.DELETE}
                onClick={() => handleDelete(doc)}
                disabled={isProcessing}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full animate-pulse rounded-full bg-primary"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
            <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" />
          </div>
        </div>
      )}
    </div>
  );
}

export function UploadDocModal({ open, billingId, companyId, onClose }: UploadDocModalProps) {
  const { data, isLoading, refetch } = useBillingDocuments({ billingId, companyId });

  const requirements: BillingDocumentRequirement[] = data?.data?.requirements ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{BILLING_MODAL_LABELS.DOCUMENTS.TITLE}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {BILLING_MODAL_LABELS.DOCUMENTS.LOADING}
          </div>
        ) : requirements.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {BILLING_MODAL_LABELS.DOCUMENTS.EMPTY}
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
            {requirements.map((req) => (
              <DocRow
                key={req.id}
                req={req}
                billingId={billingId}
                companyId={companyId}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
