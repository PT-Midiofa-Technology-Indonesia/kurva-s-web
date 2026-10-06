import { Download, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { formatFileSize } from '@/shared/utils/format';

export interface FileAttachmentListItem {
  id: string;
  fileName: string;
  fileSize?: number | null;
  url?: string | null;
}

export interface FileAttachmentListGroup {
  label: string;
  files: FileAttachmentListItem[];
}

export interface FileAttachmentListProps {
  groups: FileAttachmentListGroup[];
  emptyMessage: string;
  downloadLabel: (fileName: string) => string;
  onDelete?: (id: string) => void;
  deleteLabel?: (fileName: string) => string;
}

export function FileAttachmentList({
  groups,
  emptyMessage,
  downloadLabel,
  onDelete,
  deleteLabel,
}: FileAttachmentListProps) {
  const hasFiles = groups.some((group) => group.files.length > 0);

  if (!hasFiles) return <p className="text-sm text-slate-500">{emptyMessage}</p>;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label || 'default-group'} className="space-y-2">
          {group.label ? <p className="text-sm text-slate-500">{group.label}</p> : null}
          <div className="space-y-2">
            {group.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="rounded-lg border border-slate-200 p-2 text-slate-700">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-950">{file.fileName}</p>
                  {file.fileSize !== undefined && file.fileSize !== null && (
                    <p className="text-xs text-slate-500">{formatFileSize(file.fileSize)}</p>
                  )}
                </div>
                {file.url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={downloadLabel(file.fileName)}
                    >
                      <Download className="h-4 w-4" aria-hidden />
                    </a>
                  </Button>
                )}
                {onDelete && deleteLabel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={deleteLabel(file.fileName)}
                    onClick={() => onDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
