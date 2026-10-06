'use client';

import { ChevronDown, ChevronUp, Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/components/atoms/Button';
import { Input } from '@/shared/components/atoms/Input';
import { formatFileSize } from '@/shared/utils/format';
import { SPK_UPLOAD_LABELS } from '../constants';
import { useDeleteSPK } from '../hooks/use-delete-spk';
import { useUploadSPK } from '../hooks/use-upload-spk';
import type { SPKRequirementDocument } from '../types';

interface SPKUploadSectionProps {
  projectId: string;
  spkRequirementDocument: SPKRequirementDocument;
  spkNumber?: string;
  /** When true (project started): all inputs readonly, edit button hidden */
  readOnly?: boolean;
}

export function SPKUploadSection({
  projectId,
  spkRequirementDocument,
  spkNumber = '',
  readOnly = false,
}: SPKUploadSectionProps) {
  const { documentType, uploadedDocuments } = spkRequirementDocument;
  const [isExpanded, setIsExpanded] = useState(true);
  const [spkNumberLocal, setSpkNumberLocal] = useState(spkNumber);
  const [uploadedFiles, setUploadedFiles] = useState(() => uploadedDocuments ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasExistingData = Boolean(spkNumber) || (uploadedDocuments?.length ?? 0) > 0;
  const isEditable = !readOnly && (!hasExistingData || isEditing);

  useEffect(() => {
    setUploadedFiles(uploadedDocuments ?? []);
  }, [uploadedDocuments]);

  useEffect(() => {
    setSpkNumberLocal(spkNumber);
  }, [spkNumber]);

  const accept = useMemo(
    () =>
      documentType.allowedFileTypes
        .split(',')
        .map((ext) => `.${ext.trim()}`)
        .join(','),
    [documentType.allowedFileTypes]
  );

  const maxSizeBytes = (documentType.allowedFileSize || 10240) * 1024;

  const { mutate: uploadSPK, isPending: isSaving } = useUploadSPK();
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteSPK();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      e.target.value = '';

      const filtered = files.filter((f) => {
        const acceptList = accept.split(',').map((ext) => ext.trim());
        const hasValidExt = acceptList.some((ext) => f.name.toLowerCase().endsWith(ext));
        if (!hasValidExt) return false;
        if (f.size > maxSizeBytes) return false;
        return true;
      });

      setPendingFiles((prev) => [...prev, ...filtered]);
    },
    [accept, maxSizeBytes]
  );

  function handleRemoveUploaded(uploadedDocId: string) {
    deleteDoc(
      { projectId, uploadedDocId },
      { onSuccess: () => setUploadedFiles((prev) => prev.filter((f) => f.id !== uploadedDocId)) }
    );
  }

  function handleRemovePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelEdit() {
    setSpkNumberLocal(spkNumber);
    setUploadedFiles(uploadedDocuments ?? []);
    setPendingFiles([]);
    setIsEditing(false);
  }

  function handleUploadPending() {
    if (pendingFiles.length === 0) return;

    uploadSPK(
      {
        projectId,
        spkNumber: spkNumberLocal,
        documentTypeId: documentType.id,
        files: pendingFiles,
      },
      {
        onSuccess: () => {
          setPendingFiles([]);
          setIsEditing(false);
        },
      }
    );
  }

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-4.5 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setIsExpanded((p) => !p)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-base font-semibold text-slate-950">SPK</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <>
          {documentType === null && (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
              {SPK_UPLOAD_LABELS.EMPTY_REQUIREMENT_MESSAGE}
            </div>
          )}

          {documentType !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: SPK Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {SPK_UPLOAD_LABELS.SPK_NUMBER_LABEL}
                    <span className="text-primary"> {SPK_UPLOAD_LABELS.SPK_NUMBER_REQUIRED}</span>
                  </label>
                  <Input
                    type="text"
                    value={spkNumberLocal}
                    onChange={(e) => setSpkNumberLocal(e.target.value)}
                    placeholder={SPK_UPLOAD_LABELS.SPK_NUMBER_PLACEHOLDER}
                    readOnly={!isEditable}
                  />
                </div>

                {/* Right: Files */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        {documentType.name}
                        {documentType.isMandatory && <span className="text-primary"> *</span>}
                      </span>
                      {(documentType.allowedFileTypes || documentType.allowedFileSize) && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {documentType.allowedFileTypes && `${documentType.allowedFileTypes}`}
                          {documentType.allowedFileTypes && documentType.allowedFileSize && ' | '}
                          {documentType.allowedFileSize != null &&
                            `Max ${formatFileSize(maxSizeBytes)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditable && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            leftIcon={<Upload size={14} />}
                            onClick={() => inputRef.current?.click()}
                            disabled={isSaving}
                          >
                            {pendingFiles.length > 0 || uploadedFiles.length > 0
                              ? SPK_UPLOAD_LABELS.BUTTONS.ADD_FILE
                              : SPK_UPLOAD_LABELS.BUTTONS.BROWSE_FILE}
                          </Button>
                          <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept={accept}
                            multiple
                            onChange={handleFileSelect}
                            aria-hidden
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* File List */}
                  <div className="space-y-3">
                    {pendingFiles.length > 0 || uploadedFiles.length > 0 ? (
                      <>
                        {/* Pending files (not yet uploaded) */}
                        {pendingFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}`}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                                <FileText size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-700">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                              {isEditable && !isSaving && (
                                <button
                                  type="button"
                                  className="shrink-0 text-slate-400 hover:text-slate-600"
                                  aria-label="Remove pending file"
                                  onClick={() => handleRemovePending(index)}
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Uploaded files */}
                        {uploadedFiles.map((itemFile) => (
                          <div
                            key={itemFile.id}
                            className="rounded-lg border border-slate-200 bg-white p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                                <FileText size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-700">
                                  {itemFile.fileName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatFileSize(itemFile.fileSize)}
                                </p>
                              </div>
                              <a
                                href={itemFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-cyan-500 hover:text-cyan-600"
                                aria-label="Download file"
                              >
                                <Download size={18} />
                              </a>
                              {!isSaving && isEditable && (
                                <button
                                  type="button"
                                  className="shrink-0 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                                  aria-label="Remove file"
                                  onClick={() => handleRemoveUploaded(itemFile.id)}
                                  disabled={isSaving || isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                  ) : (
                                    <X size={18} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="py-4 text-center text-sm text-slate-400">
                        {SPK_UPLOAD_LABELS.EMPTY_DOCUMENT}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!readOnly && (
                <div className="flex justify-end gap-2">
                  {isEditable ? (
                    <>
                      {hasExistingData && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={handleCancelEdit}
                        >
                          {SPK_UPLOAD_LABELS.BUTTONS.CANCEL}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        disabled={isSaving || pendingFiles.length === 0}
                        onClick={handleUploadPending}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            {SPK_UPLOAD_LABELS.BUTTONS.SAVING}
                          </>
                        ) : (
                          SPK_UPLOAD_LABELS.BUTTONS.SAVE
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={isSaving}
                      onClick={() => setIsEditing(true)}
                    >
                      {SPK_UPLOAD_LABELS.BUTTONS.EDIT}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
