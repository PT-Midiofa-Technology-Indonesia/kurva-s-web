'use client';

import { Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { formatFileSize } from '@/shared/utils/format';
import { PROSPECT_LABELS } from '../constants';
import { useDeleteProjectDocument } from '../hooks/use-delete-project-document';
import { useUploadProjectDocument } from '../hooks/use-upload-project-document';
import type { ProspectDetailDocument } from '../types';

const labels = PROSPECT_LABELS.DETAIL;

export interface ProspectDocumentRowProps {
  doc: ProspectDetailDocument;
  projectId: string;
  isReadOnly: boolean;
  onSuccess?: () => void;
}

export function ProspectDocumentRow({
  doc,
  projectId,
  isReadOnly,
  onSuccess,
}: ProspectDocumentRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { mutate: uploadDoc, isPending: isUploading } = useUploadProjectDocument(projectId);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteProjectDocument(projectId);

  const isProcessing = isUploading || isDeleting;
  const uploadedFiles = doc.uploadedDocuments ?? [];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadProgress(0);

    const handleSuccess = () => {
      setUploadProgress(null);
      onSuccess?.();
    };
    const onError = () => {
      setUploadProgress(null);
    };

    uploadDoc(
      {
        projectId,
        documentTypeId: doc.documentType.id,
        file,
        onUploadProgress: setUploadProgress,
      },
      { onSuccess: handleSuccess, onError }
    );
  }

  function handleRemove(uploadedDocId: string) {
    deleteDoc({ projectId, uploadedDocId }, { onSuccess: () => onSuccess?.() });
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-700">
            {doc.documentType.name}
            {doc.isMandatory && <span className="text-primary"> *</span>}
          </span>
          {(doc.documentType.allowedFileTypes || doc.documentType.allowedFileSize) && (
            <p className="mt-0.5 text-xs text-slate-400">
              {doc.documentType.allowedFileTypes && `${doc.documentType.allowedFileTypes}`}
              {doc.documentType.allowedFileTypes && doc.documentType.allowedFileSize && ' | '}
              {doc.documentType.allowedFileSize != null &&
                `Max ${formatFileSize(doc.documentType.allowedFileSize * 1024)}`}
            </p>
          )}
        </div>
        {!isReadOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => inputRef.current?.click()}
              disabled={isProcessing}
            >
              {uploadedFiles.length > 0 ? labels.BUTTONS.ADD_FILE : labels.BUTTONS.BROWSE_FILE}
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              aria-hidden
            />
          </>
        )}
      </div>

      {uploadedFiles.map((itemFile) => {
        return (
          <div key={itemFile.id} className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">{itemFile.fileName}</p>
                <p className="text-xs text-slate-400">{formatFileSize(itemFile.fileSize)}</p>
              </div>
              {uploadProgress === null && (
                <a
                  href={itemFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-cyan-500 hover:text-cyan-600"
                  aria-label="Download file"
                >
                  <Download size={18} />
                </a>
              )}
              {uploadProgress !== null ? (
                <Loader2 size={18} className="shrink-0 animate-spin text-slate-400" />
              ) : (
                !isReadOnly && (
                  <button
                    type="button"
                    className="shrink-0 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                    aria-label="Remove file"
                    onClick={() => handleRemove(itemFile.id)}
                    disabled={isDeleting}
                  >
                    <X size={18} />
                  </button>
                )
              )}
            </div>
            {uploadProgress !== null && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
