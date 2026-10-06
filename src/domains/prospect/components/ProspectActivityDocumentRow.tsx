import { Download, FileText, X } from 'lucide-react';
import { formatDate, formatFileSize } from '@/shared/utils/format';
import type { ProspectDetailActivityDocument } from '../types';

export function ProspectActivityDocumentRow({
  doc,
  projectId,
  onDelete,
}: {
  doc: ProspectDetailActivityDocument;
  projectId: string;
  onDelete: (payload: { projectId: string; documentId: string }) => void;
}) {
  const file = doc.uploadedDocument;

  return (
    <div className="flex items-center gap-3 bg-white px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{file.fileName}</p>
        <p className="text-xs text-slate-400">
          {formatFileSize(file.fileSize)} &middot; {file.uploadedBy.name} &middot;{' '}
          {formatDate(file.uploadedAt)}
        </p>
      </div>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-cyan-500 hover:text-cyan-600"
        aria-label={`Download ${file.fileName}`}
      >
        <Download size={16} />
      </a>
      <button
        type="button"
        className="shrink-0 text-slate-400 hover:text-slate-600"
        aria-label={`Delete ${file.fileName}`}
        onClick={() => onDelete({ projectId, documentId: doc.id })}
      >
        <X size={16} />
      </button>
    </div>
  );
}
