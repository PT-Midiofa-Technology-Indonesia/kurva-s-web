'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { formatDateTime } from '@/shared/utils/format';
import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import type { ManpowerTimelineEntry } from '../types/manpower-planning';

const labels = MANPOWER_PLAN_LABELS.TIMELINE;
const kindLabels = MANPOWER_PLAN_LABELS.TIMELINE_KIND_LABELS;

interface ManpowerTimelineProps {
  entries: ManpowerTimelineEntry[];
}

/**
 * Pure presentational QC timeline of one manpower card — vertical rail + dot markers, one row per
 * `ManpowerTimelineEntry`. Shared by Selesaikan/Detail Pekerjaan and the QC review/detail dialogs.
 */
export function ManpowerTimeline({ entries }: ManpowerTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">{labels.EMPTY}</p>;
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry) => {
        const revisionSuffix =
          entry.kind === 'resubmitted' && typeof entry.revisionNo === 'number'
            ? labels.REVISION_SUFFIX(entry.revisionNo)
            : '';

        return (
          <li key={entry.id} className="relative border-l border-slate-200 pb-4 pl-6 last:pb-0">
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-1 -left-[7px] size-3 rounded-full border-2 border-white',
                labels.KIND_DOT_CLASSNAMES[entry.kind]
              )}
            />

            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">{entry.actorName}</p>
              <p className="shrink-0 text-xs text-slate-500">{formatDateTime(entry.at)}</p>
            </div>

            <div className="mt-1.5">
              <Badge
                variant="secondary"
                className={cn(
                  MANPOWER_PLAN_LABELS.SELESAIKAN.REPORT_STATUS_CHROME,
                  labels.KIND_BADGE_CLASSNAMES[entry.kind]
                )}
              >
                {kindLabels[entry.kind] + revisionSuffix}
              </Badge>
            </div>

            <p className="mt-1.5 text-sm text-slate-600">{entry.body}</p>

            {entry.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.attachments.map((attachment) =>
                  attachment.url ? (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={labels.ATTACHMENT_ARIA_LABEL(attachment.fileName)}
                      title={attachment.fileName}
                      className="inline-flex max-w-full items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                    >
                      <span className="truncate">{attachment.fileName}</span>
                    </a>
                  ) : (
                    <span
                      key={attachment.id}
                      title={attachment.fileName}
                      className="inline-flex max-w-full items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600"
                    >
                      <span className="truncate">{attachment.fileName}</span>
                    </span>
                  )
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
