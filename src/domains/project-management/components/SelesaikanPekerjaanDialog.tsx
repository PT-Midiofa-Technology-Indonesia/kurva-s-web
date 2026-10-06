'use client';

import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileInput } from '@/components/molecules';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';
import { MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import { useManpowerAssignment, useSubmitManpowerReports } from '../hooks';
import { computeCompletionCount } from '../services/manpower-plan-flow.service';
import type { ManpowerCard, ManpowerPlanTreeItem } from '../types/manpower-planning';
import { ManpowerTimeline } from './ManpowerTimeline';

// ─── Draft model ──────────────────────────────────────────────────────────────

/**
 * Editable daily report of one manpower card. `achievedQty` stays the raw input string because a
 * number input can be empty/invalid mid-edit — only numeric values reach the payload.
 */
interface ManpowerReportDraft {
  achievedQty: string;
  note: string;
  files: File[];
}

/** Keyed by `ManpowerCard.id` so a card's draft survives an expand/collapse of its accordion. */
type ManpowerReportDrafts = Record<string, ManpowerReportDraft>;

type ManpowerReportDraftPatch = Partial<ManpowerReportDraft>;

type SelesaikanDialogMode = 'selesaikan' | 'detail';

/** Raw input → payload number; empty, non-numeric or negative input means "not filled". */
function parseAchievedQty(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

// ─── Manpower report card ─────────────────────────────────────────────────────

interface ManpowerReportCardProps {
  card: ManpowerCard;
  unit: string;
  todayLabel: string;
  draft: ManpowerReportDraft;
  isExpanded: boolean;
  /** `mode='detail'` — timeline only, no Laporan Harian inputs. */
  isReadOnly: boolean;
  isSubmitting: boolean;
  onToggleExpanded: () => void;
  onPatch: (patch: ManpowerReportDraftPatch) => void;
}

/** One accordion card: header (name + helpers/target + status badge + chevron) and its tabs. */
function ManpowerReportCard({
  card,
  unit,
  todayLabel,
  draft,
  isExpanded,
  isReadOnly,
  isSubmitting,
  onToggleExpanded,
  onPatch,
}: ManpowerReportCardProps) {
  const labels = MANPOWER_PLAN_LABELS.SELESAIKAN;
  const fieldIdPrefix = `selesaikan-pekerjaan-${card.id}`;
  const helperNames = card.helpers.map((helper) => helper.fullName).join(', ');
  /**
   * `Belum Diselesaikan` and `Ditolak` cards take today's report — a QC rejection reopens the
   * card so the assignee can repair and resubmit it. Only `Menunggu QC` / `Diterima` are
   * server-owned.
   */
  const isReportEditable =
    card.reportStatus === 'Belum Diselesaikan' || card.reportStatus === 'Ditolak';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={labels.EXPAND_ARIA_LABEL(card.employee.fullName)}
        onClick={onToggleExpanded}
        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-950">
            {card.employee.fullName}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {labels.HELPER_NAMES(helperNames || labels.EMPTY)} ·{' '}
            {labels.TARGET(card.targetQty, unit)}
            {card.note ? `, ${card.note}` : ''}
          </span>
        </span>
        <Badge
          variant="secondary"
          className={cn(
            'shrink-0',
            labels.REPORT_STATUS_CHROME,
            MANPOWER_PLAN_LABELS.REPORT_STATUS_BADGE_CLASSNAMES[card.reportStatus]
          )}
        >
          {card.reportStatus}
        </Badge>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-slate-500 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className="bg-slate-50 p-4">
          {/* Detail mode opens on Riwayat — the daily form there is server-owned reference. */}
          <Tabs defaultValue={isReadOnly ? 'history' : 'daily'}>
            <TabsList>
              <TabsTrigger value="daily" className="data-[state=active]:text-teal-700">
                {labels.TAB_DAILY}
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:text-teal-700">
                {labels.TAB_HISTORY}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor={`${fieldIdPrefix}-date`}
                    className="text-sm leading-none font-medium"
                  >
                    {labels.REPORT_DATE_LABEL}
                  </Label>
                  <Input
                    id={`${fieldIdPrefix}-date`}
                    value={todayLabel}
                    readOnly
                    disabled
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`${fieldIdPrefix}-achieved`}
                    className="text-sm leading-none font-medium"
                  >
                    {labels.ACHIEVED_LABEL}
                  </Label>
                  <InputGroup className="h-11! rounded-xl border-slate-300 bg-white">
                    <InputGroupInput
                      id={`${fieldIdPrefix}-achieved`}
                      type="number"
                      min={0}
                      inputMode="decimal"
                      placeholder={labels.CAPAIAN_PLACEHOLDER}
                      value={draft.achievedQty}
                      disabled={isSubmitting || isReadOnly || !isReportEditable}
                      onChange={(event) => onPatch({ achievedQty: event.target.value })}
                      className="text-sm"
                    />
                    {unit && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{unit}</InputGroupText>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`${fieldIdPrefix}-note`}
                  className="text-sm leading-none font-medium"
                >
                  {labels.NOTE_LABEL}
                </Label>
                <Textarea
                  id={`${fieldIdPrefix}-note`}
                  value={draft.note}
                  onChange={(event) => onPatch({ note: event.target.value })}
                  disabled={isSubmitting || isReadOnly || !isReportEditable}
                  placeholder={labels.NOTE_PLACEHOLDER}
                  className="min-h-24 rounded-xl border-slate-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm leading-none font-medium">{labels.EVIDENCE_LABEL}</Label>
                <FileInput
                  value={draft.files}
                  onChange={(files) => onPatch({ files })}
                  accept={labels.EVIDENCE_ACCEPT}
                  maxFiles={labels.EVIDENCE_MAX_FILES}
                  maxSize={labels.EVIDENCE_MAX_SIZE_BYTES}
                  disabled={isSubmitting || isReadOnly || !isReportEditable}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ManpowerTimeline entries={card.timeline} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface SelesaikanPekerjaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ManpowerPlanTreeItem | null;
  /** `detail` renders the read-only "Detail Pekerjaan" variant. */
  mode: SelesaikanDialogMode;
  /** Called after a successful submit — the tree query is invalidated by the hook itself. */
  onCompleted?: () => void;
}

export function SelesaikanPekerjaanDialog({
  open,
  onOpenChange,
  item,
  mode,
  onCompleted,
}: SelesaikanPekerjaanDialogProps) {
  const labels = MANPOWER_PLAN_LABELS.SELESAIKAN;
  const isReadOnly = mode === 'detail';

  const [drafts, setDrafts] = useState<ManpowerReportDrafts>({});
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);

  const { mutate: submitReports, isPending: isSubmitting } = useSubmitManpowerReports();

  const boqItemId = open ? (item?.id ?? null) : null;
  const { data: detail, isLoading: isLoadingDetail } = useManpowerAssignment(boqItemId);

  /** One seed per open session — a background refetch must not clobber in-progress edits. */
  const seededBoqItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      seededBoqItemIdRef.current = null;
      setDrafts({});
      setExpandedCardIds([]);
      return;
    }

    if (!detail) return;
    if (seededBoqItemIdRef.current === detail.boqItemId) return;
    seededBoqItemIdRef.current = detail.boqItemId;

    const next: ManpowerReportDrafts = {};
    for (const card of detail.manpowers) {
      next[card.id] = { achievedQty: '', note: '', files: [] };
    }

    setDrafts(next);
    // Detail mode lists every card collapsed — the read-only history opens on demand.
    setExpandedCardIds(!isReadOnly && detail.manpowers.length > 0 ? [detail.manpowers[0].id] : []);
  }, [open, detail, isReadOnly]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedCardIds((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]
    );
  }, []);

  const patchDraft = useCallback((id: string, patch: ManpowerReportDraftPatch) => {
    setDrafts((previous) => {
      const current = previous[id] ?? { achievedQty: '', note: '', files: [] };
      return { ...previous, [id]: { ...current, ...patch } };
    });
  }, []);

  /** `computeCompletionCount` reads numeric-or-null drafts — parse the raw input strings once. */
  const achievedDrafts = useMemo<Record<string, number | null>>(() => {
    const map: Record<string, number | null> = {};
    for (const [manpowerId, draft] of Object.entries(drafts)) {
      map[manpowerId] = parseAchievedQty(draft.achievedQty);
    }
    return map;
  }, [drafts]);

  const manpowers = useMemo(() => detail?.manpowers ?? [], [detail]);
  const completionCount = useMemo(
    () => computeCompletionCount(manpowers, achievedDrafts),
    [manpowers, achievedDrafts]
  );

  /**
   * What the submit would actually send — `Belum Diselesaikan` cards plus `Ditolak` cards the
   * assignee is repairing (a rejection reopens the card for resubmission). Terminal cards
   * (`Menunggu QC` / `Diterima`) are server-owned until QC reopens them, so their Laporan Harian
   * inputs are disabled and they contribute nothing to the payload. `Diterima` cards still count
   * toward the footer counter without any input, so the counter alone cannot gate the button —
   * only a parsed report can.
   */
  const reports = useMemo(
    () =>
      manpowers.flatMap((card) => {
        if (card.reportStatus !== 'Belum Diselesaikan' && card.reportStatus !== 'Ditolak') {
          return [];
        }

        const draft = drafts[card.id];
        const achievedQty = draft ? parseAchievedQty(draft.achievedQty) : null;
        if (achievedQty === null) return [];

        return [
          {
            manpowerId: card.id,
            achievedQty,
            note: draft.note.trim() ? draft.note.trim() : undefined,
            files: draft.files.length > 0 ? draft.files : undefined,
          },
        ];
      }),
    [manpowers, drafts]
  );

  const todayLabel = formatDate(new Date());

  const handleSubmit = () => {
    if (!item || !detail) return;

    // The Selesaikan button is disabled while `reports` is empty, so this only guards a click that
    // slipped through (e.g. a race with the derived state) — there is simply nothing to submit.
    if (reports.length === 0) return;

    submitReports(
      { boqItemId: item.id, reports },
      {
        onSuccess: () => {
          toast.success({ title: labels.SUCCESS_TOAST });
          onOpenChange(false);
          onCompleted?.();
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {labels.TITLES[mode]}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {item ? labels.SUBTITLE(item.code, item.name) : labels.EMPTY}
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">{labels.CREATED_BY}</p>
              <p className="text-sm font-medium text-slate-950">
                {detail?.createdBy ?? labels.EMPTY}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{labels.VOLUME_LABEL}</p>
              <p className="text-sm font-medium text-slate-950">
                {detail
                  ? `${detail.volumeBoq.value} ${detail.volumeBoq.unit}`
                  : labels.LOADING_PLACEHOLDER}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{labels.TOTAL_MANPOWER}</p>
              <p className="text-sm font-medium text-slate-950">
                {detail ? detail.manpowers.length : labels.LOADING_PLACEHOLDER}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{labels.LAST_UPDATE}</p>
              <p className="text-sm font-medium text-slate-950">
                {detail?.lastUpdate ? formatDate(detail.lastUpdate) : labels.EMPTY}
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-950">{labels.SECTION_TITLE}</h3>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                {labels.LOADING}
              </div>
            ) : manpowers.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">{labels.EMPTY_MANPOWER}</p>
            ) : (
              manpowers.map((card) => (
                <ManpowerReportCard
                  key={card.id}
                  card={card}
                  unit={detail?.volumeBoq.unit ?? ''}
                  todayLabel={todayLabel}
                  draft={drafts[card.id] ?? { achievedQty: '', note: '', files: [] }}
                  isExpanded={expandedCardIds.includes(card.id)}
                  isReadOnly={isReadOnly}
                  isSubmitting={isSubmitting}
                  onToggleExpanded={() => toggleExpanded(card.id)}
                  onPatch={(patch) => patchDraft(card.id, patch)}
                />
              ))
            )}
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 p-5">
          {!isReadOnly && (
            <p className="text-sm text-slate-600">
              {labels.FOOTER_COUNT(completionCount, manpowers.length)}
            </p>
          )}
          {isReadOnly ? (
            <Button
              type="button"
              variant="outline"
              className="ml-auto h-11 rounded-xl border-slate-300 px-8 text-sm"
              onClick={() => onOpenChange(false)}
            >
              {labels.CLOSE}
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-300 px-8 text-sm"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                {labels.CANCEL}
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl bg-teal-600 px-8 text-sm text-white hover:bg-teal-700"
                disabled={reports.length === 0 || isLoadingDetail || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? labels.SUBMITTING : labels.SUBMIT}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
