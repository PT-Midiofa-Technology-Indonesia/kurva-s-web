'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { ExistingFile } from '@/shared/components/organisms/FormGenerator/types';
import { formatFileSize } from '@/shared/utils/format';

/** Read-only card for an already-uploaded evidence file (task or QC evidence). */
export function EvidenceFileCard({ file }: { file: ExistingFile }) {
  const isImage = file.mimeType?.startsWith('image/') ?? false;

  return (
    <div className="p-3 border border-slate-200 rounded-lg bg-white">
      <div className="flex items-center gap-3">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
          aria-label={`Open ${file.fileName} in new tab`}
        >
          {isImage ? (
            // biome-ignore lint/performance/noImgElement: remote evidence file, not a next/image-eligible local asset
            <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-6 h-6 text-slate-950" />
          )}
        </a>

        <div className="flex-1 min-w-0">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-1 text-sm font-medium text-slate-950 hover:underline"
            title={file.fileName}
          >
            <span className="block flex-1 truncate">{file.fileName}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
          {file.fileSize !== undefined && (
            <p className="text-slate-500 text-xs">{formatFileSize(file.fileSize)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
