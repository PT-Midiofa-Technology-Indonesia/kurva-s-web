'use client';

import { ExternalLink, FileText, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ExistingFile } from '@/shared/components/organisms/FormGenerator/types';
import { formatFileSize } from '@/shared/utils/format';
import { Button } from '../../atoms';

export interface FileInputProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  error?: string;
  existingFiles?: ExistingFile[];
  onExistingFilesChange?: (files: ExistingFile[]) => void;
  /** Files currently being uploaded — their cards show a spinner instead of the remove button */
  pendingFiles?: File[];
  /** Upload progress (0-100) keyed by File reference, shown as a progress bar under the file card */
  fileProgress?: Map<File, number>;
  listPosition?: 'top' | 'bottom';
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="w-6 h-6" />,
  'application/msword': <FileText className="w-6 h-6" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
    <FileText className="w-6 h-6" />
  ),
  'application/vnd.ms-excel': <FileText className="w-6 h-6" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (
    <FileText className="w-6 h-6" />
  ),
};

function getFileIcon(mimeType?: string): React.ReactNode {
  if (mimeType?.startsWith('image/')) {
    return <ImageIcon className="w-6 h-6" />;
  }
  return (mimeType && FILE_ICONS[mimeType]) || <FileText className="w-6 h-6" />;
}

interface PreviewEntry {
  key: string;
  name: string;
  size?: number;
  mimeType?: string;
  previewUrl: string;
  href: string;
  isImage: boolean;
  source: 'new' | 'existing';
  existingId?: string;
  originalFile?: File;
}

export const FileInput = ({
  value = [],
  onChange,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  disabled = false,
  error,
  existingFiles = [],
  onExistingFilesChange,
  pendingFiles = [],
  fileProgress,
  listPosition = 'bottom',
}: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const newFilePreviews = useMemo<PreviewEntry[]>(
    () =>
      value.map((file, index) => ({
        key: `new-${file.name}-${index}-${file.size}`,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
        href: URL.createObjectURL(file),
        isImage: file.type.startsWith('image/'),
        source: 'new',
        originalFile: file,
      })),
    [value]
  );

  const existingFilePreviews = useMemo<PreviewEntry[]>(
    () =>
      existingFiles.map((file) => ({
        key: `existing-${file.id}`,
        name: file.fileName,
        size: file.fileSize,
        mimeType: file.mimeType,
        previewUrl: file.url,
        href: file.url,
        isImage: file.mimeType?.startsWith('image/') ?? false,
        source: 'existing',
        existingId: file.id,
      })),
    [existingFiles]
  );

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((entry) => {
        URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, [newFilePreviews]);

  const totalFiles = newFilePreviews.length + existingFilePreviews.length;

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    let errorMsg: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        errorMsg = `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`;
        break;
      }

      validFiles.push(file);
    }

    if (totalFiles + validFiles.length > maxFiles) {
      errorMsg = `Maximum ${maxFiles} files allowed`;
    }

    setLocalError(errorMsg || null);
    return errorMsg ? [] : validFiles;
  };

  const handleFileChange = (files: FileList) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      const newFiles = [...value, ...validFiles];
      onChange?.(newFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!disabled && e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
    setLocalError(null);
  };

  const handleRemoveExistingFile = (id: string) => {
    onExistingFilesChange?.(existingFiles.filter((file) => file.id !== id));
  };

  const canAddMore = totalFiles < maxFiles;

  /** Lowercase comma-spaced list of accepted extensions + size cap — "docx, xls, … (max 5 files, up to 5MB each)". */
  const dropzoneHint = `${accept ? `${accept.replace(/\./g, '').split(',').join(', ')} ` : ''}(max ${maxFiles} files, up to ${formatFileSize(maxSize).replace(' ', '')} each)`;

  const fileList = (
    <div className="flex flex-col gap-3">
      {[...existingFilePreviews, ...newFilePreviews].map((entry) => {
        const isFilePending =
          entry.source === 'new' &&
          entry.originalFile != null &&
          pendingFiles.includes(entry.originalFile);
        const progress =
          isFilePending && entry.originalFile != null
            ? fileProgress?.get(entry.originalFile)
            : undefined;

        return (
          <div key={entry.key} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <a
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 transition-opacity hover:opacity-80"
                aria-label={`Open ${entry.name} in new tab`}
              >
                {entry.isImage ? (
                  // biome-ignore lint/performance/noImgElement: blob/object URLs from user uploads cannot use next/image
                  <img
                    src={entry.previewUrl}
                    alt={entry.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-slate-950">{getFileIcon(entry.mimeType)}</span>
                )}
              </a>

              <div className="min-w-0 flex-1">
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 truncate text-sm font-medium text-slate-950 hover:underline"
                  title={entry.name}
                >
                  <span className="truncate">{entry.name}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {entry.size !== undefined && (
                  <p className="text-xs text-slate-500">{formatFileSize(entry.size)}</p>
                )}
              </div>

              {isFilePending ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-slate-400"
                  aria-label="Uploading…"
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size={'xs'}
                  onClick={() =>
                    entry.source === 'existing' && entry.existingId
                      ? handleRemoveExistingFile(entry.existingId)
                      : handleRemoveFile(newFilePreviews.findIndex((p) => p.key === entry.key))
                  }
                  disabled={disabled}
                  aria-label={`Remove ${entry.name}`}
                >
                  <X />
                </Button>
              )}
            </div>

            {isFilePending && progress !== undefined && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {listPosition === 'top' && totalFiles > 0 ? fileList : null}
      <section
        className={cn(
          'border-2 border-dashed rounded-lg bg-white p-4 transition-colors',
          dragActive && 'bg-brand-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        aria-label="File upload area"
      >
        {totalFiles === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-slate-950 font-medium text-sm">Drag & drop files here</p>
              <p className="text-slate-500 text-xs mt-1">{dropzoneHint}</p>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-950 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Browse files
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-slate-950 font-medium text-sm">Drag & drop more files here</p>
              <p className="text-slate-500 text-xs mt-1">{dropzoneHint}</p>
            </div>

            {canAddMore && (
              <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                variant="outline"
              >
                Add More
              </Button>
            )}
          </div>
        )}
      </section>

      {listPosition === 'bottom' && totalFiles > 0 ? fileList : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        aria-hidden
      />

      {displayError && <p className="text-red-500 text-sm">{displayError}</p>}
    </div>
  );
};
