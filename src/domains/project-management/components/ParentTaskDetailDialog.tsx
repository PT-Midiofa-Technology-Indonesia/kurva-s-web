'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { BADGE_CHROME, MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import type { ManpowerPlanTreeItem, ParentTaskDetail } from '../types/manpower-planning';

interface ParentTaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Parent row whose summary + direct children are rendered — the tree already has both. */
  item: ManpowerPlanTreeItem | null;
  /**
   * Fetched summary of the same item (`useParentTaskDetail`) — server truth for every field, and
   * the only source for the ones the tree does not carry (createdBy, note, assign date). Null
   * while the fetch is in flight; Assign/Last Updated then fall back to the tree row.
   */
  detail?: ParentTaskDetail | null;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm text-slate-950">{value}</p>
    </div>
  );
}

export function ParentTaskDetailDialog({
  open,
  onOpenChange,
  item,
  detail,
}: ParentTaskDetailDialogProps) {
  const labels = MANPOWER_PLAN_LABELS.PARENT_DETAIL;

  /**
   * Assignee + last update exist on both sources: the tree row renders instantly, the fetched
   * detail is the server truth — precedence is detail > tree row > EMPTY.
   */
  const assignee =
    detail?.assignee ?? (item?.assignees.length ? item.assignees.join(', ') : labels.EMPTY);
  const lastUpdate = detail?.lastUpdate ?? item?.lastUpdate ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {labels.TITLE}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {item ? labels.SUBTITLE(item.code, item.name) : labels.EMPTY}
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
            <DetailField label={labels.CREATED_BY} value={detail?.createdBy ?? labels.EMPTY} />
            <DetailField label={labels.ASSIGN} value={assignee} />
            <DetailField
              label={labels.ASSIGN_DATE}
              value={detail?.assignDate ? formatDate(detail.assignDate) : labels.EMPTY}
            />
            <DetailField
              label={labels.LAST_UPDATED}
              value={lastUpdate ? formatDate(lastUpdate) : labels.EMPTY}
            />
            <DetailField label={labels.NOTE} value={detail?.note ?? labels.EMPTY} />
          </div>

          <section className="space-y-2">
            <h3 className="text-base leading-tight font-semibold text-slate-950">
              {labels.ITEMS_SECTION_TITLE}
            </h3>
            <div className="space-y-2">
              {(item?.children ?? []).map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
                >
                  <Badge
                    variant="secondary"
                    className="w-fit shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {child.code}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-950">
                    {child.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      BADGE_CHROME.STATUS,
                      MANPOWER_PLAN_LABELS.STATUS_BADGE_CLASSNAMES[child.status]
                    )}
                  >
                    {child.status}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 p-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-28 rounded-xl border-slate-300 px-5 text-sm"
            onClick={() => onOpenChange(false)}
          >
            {labels.CLOSE}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
