'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpRightFromSquare, FileText, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import { COMMON_LABELS } from '@/shared/constants';
import { toast } from '@/shared/lib/toast';
import { formatFileSize } from '@/shared/utils/format';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { useDeleteDocument } from '../hooks/use-delete-document';
import { PAYMENT_REQUEST_QUERY_KEYS } from '../hooks/use-payment-requests';
import { useUploadDocument } from '../hooks/use-upload-document';
import type { PaymentRequestDocumentRequirement, PaymentRequestUploadedDocument } from '../types';
import { AccordionCard } from './PaymentRequestDetailSections';

const labels = PAYMENT_REQUEST_LABELS.DETAIL;

interface SupportingDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  paymentRequestId: string;
  documents: PaymentRequestDocumentRequirement[];
}

interface SupportingDocumentsCardProps {
  paymentRequestId: string;
  documents: PaymentRequestDocumentRequirement[];
}

type LocalFilesMap = Record<string, File[]>;

function buildAcceptValue(allowedFileTypes: string | null | undefined) {
  if (!allowedFileTypes) return undefined;
  return allowedFileTypes
    .split(',')
    .map((type) => `.${type.trim()}`)
    .join(',');
}

function getMaxSize(allowedMaxSize: number | null | undefined) {
  return allowedMaxSize != null ? allowedMaxSize * 1024 : 5 * 1024 * 1024;
}

export function SupportingDocumentsModal({
  open,
  onClose,
  paymentRequestId,
  documents,
}: SupportingDocumentsModalProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const queryClient = useQueryClient();
  const [localFiles, setLocalFiles] = useState<LocalFilesMap>({});
  const { mutateAsync: uploadDocument, isPending: isUploading } =
    useUploadDocument(paymentRequestId);

  const mergedDocuments = useMemo(
    () =>
      documents.map((document) => ({
        ...document,
        selectedFiles: localFiles[document.id] ?? [],
      })),
    [documents, localFiles]
  );

  const handleSelectFiles = (
    document: PaymentRequestDocumentRequirement,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const maxSize = getMaxSize(document.allowedMaxSize);
    const allowedExtensions = new Set(
      (document.allowedFileTypes ?? '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    );

    const nextFiles = Array.from(files).filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      if (allowedExtensions.size > 0 && !allowedExtensions.has(extension)) {
        toast.error({
          title: labels.SUPPORTING_DOCUMENT_INVALID_TYPE,
          description: file.name,
        });
        return false;
      }

      if (file.size > maxSize) {
        toast.error({
          title: labels.SUPPORTING_DOCUMENT_INVALID_SIZE,
          description: `${file.name} (${formatFileSize(maxSize)})`,
        });
        return false;
      }

      return true;
    });

    if (nextFiles.length === 0) return;

    setLocalFiles((prev) => ({
      ...prev,
      [document.id]: [...(prev[document.id] ?? []), ...nextFiles],
    }));
  };

  const handleRemoveLocalFile = (documentId: string, fileName: string) => {
    setLocalFiles((prev) => ({
      ...prev,
      [documentId]: (prev[documentId] ?? []).filter((file) => file.name !== fileName),
    }));
  };

  const handleSave = async () => {
    const uploadQueue = mergedDocuments.flatMap((document) =>
      document.selectedFiles.map((file) => ({
        documentTypeId: document.documentTypeId,
        file,
      }))
    );

    if (uploadQueue.length === 0) {
      onClose();
      return;
    }

    try {
      await Promise.all(
        uploadQueue.map(({ documentTypeId, file }) =>
          uploadDocument({
            documentTypeId,
            file,
          })
        )
      );

      toast.success({ title: labels.SUPPORTING_DOCUMENT_UPLOAD_SUCCESS });
      setLocalFiles({});
      await queryClient.invalidateQueries({
        queryKey: PAYMENT_REQUEST_QUERY_KEYS.detail(paymentRequestId),
      });
      onClose();
    } catch {
      toast.error({ title: labels.SUPPORTING_DOCUMENT_UPLOAD_ERROR });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle>{labels.SUPPORTING_DOCUMENT_UPLOAD_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="divide-y divide-slate-200 px-6">
          {mergedDocuments.map((document) => (
            <div key={document.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {document.documentTypeName}
                    {document.isMandatory ? <span className="text-red-500"> *</span> : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white"
                    onClick={() => inputRefs.current[document.id]?.click()}
                    disabled={isUploading}
                  >
                    <Upload data-icon="inline-start" />
                    {document.selectedFiles.length > 0 || document.uploadedDocuments.length > 0
                      ? labels.SUPPORTING_DOCUMENT_BROWSE_FILES
                      : labels.SUPPORTING_DOCUMENT_BROWSE_FILE}
                  </Button>
                  <input
                    ref={(element) => {
                      inputRefs.current[document.id] = element;
                    }}
                    type="file"
                    multiple
                    accept={buildAcceptValue(document.allowedFileTypes)}
                    className="hidden"
                    onChange={(event) => {
                      handleSelectFiles(document, event.target.files);
                      event.target.value = '';
                    }}
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {document.uploadedDocuments.map((uploadedDocument) => (
                  <a
                    key={uploadedDocument.id}
                    href={uploadedDocument.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-blue-600"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="max-w-44 truncate">{uploadedDocument.fileName}</span>
                    <span className="text-xs text-slate-400">
                      {formatFileSize(uploadedDocument.fileSize)}
                    </span>
                  </a>
                ))}

                {document.selectedFiles.map((file) => (
                  <div
                    key={`${document.id}-${file.name}-${file.size}`}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-blue-600"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="max-w-44 truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => handleRemoveLocalFile(document.id, file.name)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white px-6 pt-4 pb-6 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={onClose}
            disabled={isUploading}
          >
            {COMMON_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSave}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
            {COMMON_LABELS.ACTIONS.SAVE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupportingDocumentListItem({
  paymentRequestId,
  uploadedDocument,
}: {
  paymentRequestId: string;
  uploadedDocument: PaymentRequestUploadedDocument;
}) {
  const queryClient = useQueryClient();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument(paymentRequestId);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    deleteDocument(uploadedDocument.id, {
      onSuccess: async () => {
        toast.success({ title: labels.SUPPORTING_DOCUMENT_DELETE_SUCCESS });
        setIsDeleteConfirmOpen(false);
        await queryClient.invalidateQueries({
          queryKey: PAYMENT_REQUEST_QUERY_KEYS.detail(paymentRequestId),
        });
      },
      onError: () => {
        toast.error({ title: labels.SUPPORTING_DOCUMENT_DELETE_ERROR });
      },
    });
  };

  return (
    <>
      <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs transition-colors hover:bg-slate-50">
        <a
          href={uploadedDocument.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 max-w-full items-center gap-2"
        >
          <span className="max-w-[240px] truncate text-sm leading-5 font-medium text-slate-950">
            {uploadedDocument.fileName}
          </span>
          <ArrowUpRightFromSquare className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2.25} />
        </a>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full text-slate-500 hover:text-red-600"
          aria-label={labels.SUPPORTING_DOCUMENT_DELETE_LABEL}
          onClick={() => setIsDeleteConfirmOpen(true)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !open && setIsDeleteConfirmOpen(false)}
        variant="danger"
        title={labels.SUPPORTING_DOCUMENT_DELETE_CONFIRM_TITLE}
        description={labels.SUPPORTING_DOCUMENT_DELETE_CONFIRM_DESCRIPTION}
        cancelText={COMMON_LABELS.ACTIONS.CANCEL}
        confirmText={labels.SUPPORTING_DOCUMENT_DELETE_CONFIRM_ACTION}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

export function SupportingDocumentsCard({
  paymentRequestId,
  documents,
}: SupportingDocumentsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <AccordionCard title={labels.SUPPORTING_DOCUMENTS}>
        <div className="flex flex-wrap items-start gap-3">
          {documents.flatMap((document) =>
            document.uploadedDocuments.map((uploadedDocument) => (
              <SupportingDocumentListItem
                key={uploadedDocument.id}
                paymentRequestId={paymentRequestId}
                uploadedDocument={uploadedDocument}
              />
            ))
          )}

          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-dashed bg-white px-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus />
          </Button>
        </div>
      </AccordionCard>

      <SupportingDocumentsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentRequestId={paymentRequestId}
        documents={documents}
      />
    </>
  );
}
