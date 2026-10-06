'use client';

import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/molecules/Alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubordinateEmployees } from '@/domains/project-control';
import { AsyncSelect } from '@/shared/components/atoms';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';
import { BADGE_CHROME, MANPOWER_PLAN_LABELS } from '../constants/manpower-plan';
import { useAssignLeafManpower, useManpowerAssignment } from '../hooks';
import { assignPekerjaanSchema } from '../schemas/assign-pekerjaan';
import {
  computeTakenEmployeeIds,
  computeTotalAssignedQty,
  isCardDeletable,
  isTargetDisabled,
} from '../services/manpower-plan-flow.service';
import type { ManpowerPlanTreeItem } from '../types/manpower-planning';

// ─── Draft model ──────────────────────────────────────────────────────────────

/**
 * Editable mirror of a `ManpowerCard`. `targetQty` stays the raw input string because a number
 * input can be empty/invalid mid-edit — the Zod schema coerces it only at validation time.
 */
interface ManpowerCardDraft {
  id: string;
  /** `ManpowerCard.id` it was seeded from — null for cards the user appended. */
  detailCardId: string | null;
  employeeId: string;
  targetQty: string;
  helperEmployeeIds: string[];
  note: string;
}

type ManpowerCardDraftPatch = Partial<Omit<ManpowerCardDraft, 'id' | 'detailCardId'>>;

/** Minimal option shape shared by the Nama Select and the Helper multi-select. */
interface EmployeeOption {
  value: string;
  label: string;
}

/** Per-card lookup the Assign button is gated on, keyed by card index. */
interface ManpowerCardFieldErrors {
  employeeId?: string;
  targetQty?: string;
}

let draftIdSequence = 0;

function nextDraftId(): string {
  draftIdSequence += 1;
  return `draft-${draftIdSequence}`;
}

function createEmptyDraft(): ManpowerCardDraft {
  return {
    id: nextDraftId(),
    detailCardId: null,
    employeeId: '',
    targetQty: '',
    helperEmployeeIds: [],
    note: '',
  };
}

/** Unused card — only such a card is worth a "Volume BOQ sudah terpenuhi" in-card alert. */
function isDraftEmpty(draft: ManpowerCardDraft): boolean {
  return (
    !draft.employeeId &&
    !draft.targetQty &&
    draft.helperEmployeeIds.length === 0 &&
    !draft.note.trim()
  );
}

// ─── Manpower card editor ─────────────────────────────────────────────────────

interface ManpowerCardEditorProps {
  index: number;
  draft: ManpowerCardDraft;
  isExpanded: boolean;
  needsRepair: boolean;
  /** Backend `isCompleted` — report already submitted/terminal, every field of the card locks. */
  isCompleted: boolean;
  isDeletable: boolean;
  deleteDisabledTooltip: string;
  isTargetLocked: boolean;
  showVolumeFullAlert: boolean;
  unit: string;
  employeeOptions: EmployeeOption[];
  helperOptions: EmployeeOption[];
  takenEmployeeIds: Set<string>;
  employeeError?: string;
  targetError?: string;
  isSubmitting: boolean;
  isLoadingEmployees: boolean;
  onToggleExpanded: (id: string) => void;
  onDelete: (id: string) => void;
  onPatch: (id: string, patch: ManpowerCardDraftPatch) => void;
}

/** One accordion card: header (chevron + `Manpower {n}` + badge + trash) and the editable grid. */
function ManpowerCardEditor({
  index,
  draft,
  isExpanded,
  needsRepair,
  isCompleted,
  isDeletable,
  deleteDisabledTooltip,
  isTargetLocked,
  showVolumeFullAlert,
  unit,
  employeeOptions,
  helperOptions,
  takenEmployeeIds,
  employeeError,
  targetError,
  isSubmitting,
  isLoadingEmployees,
  onToggleExpanded,
  onDelete,
  onPatch,
}: ManpowerCardEditorProps) {
  const labels = MANPOWER_PLAN_LABELS.ASSIGN_PEKERJAAN;
  const fieldIdPrefix = `assign-pekerjaan-${draft.id}`;

  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={labels.CARD_TITLE(index + 1)}
          onClick={() => onToggleExpanded(draft.id)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-slate-500 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
          <span className="truncate text-sm font-medium text-slate-950">
            {labels.CARD_TITLE(index + 1)}
          </span>
        </button>
        {needsRepair && (
          <Badge
            variant="outline"
            className="h-5 shrink-0 rounded-md border-red-300 bg-white px-2 py-0.5 text-xs font-medium text-red-600"
          >
            {labels.NEEDS_REPAIR_BADGE}
          </Badge>
        )}
        {isCompleted && (
          <Badge
            variant="secondary"
            className={cn(
              'shrink-0',
              BADGE_CHROME.STATUS,
              MANPOWER_PLAN_LABELS.STATUS_BADGE_CLASSNAMES.Selesai
            )}
          >
            {labels.COMPLETED_BADGE}
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* A disabled <button> swallows pointer events, so the hover target is a wrapper. */}
              <span className="inline-flex shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={labels.DELETE_ARIA_LABEL}
                  className="text-slate-400 hover:text-slate-950"
                  disabled={!isDeletable || isSubmitting}
                  onClick={() => onDelete(draft.id)}
                >
                  <Trash2 />
                </Button>
              </span>
            </TooltipTrigger>
            {!isDeletable && <TooltipContent>{deleteDisabledTooltip}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t border-slate-200 p-4">
          {showVolumeFullAlert && (
            <Alert variant="destructive">
              <AlertTitle className="font-semibold">{labels.VOLUME_FULL_TITLE}</AlertTitle>
              <AlertDescription>{labels.VOLUME_FULL_BODY}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-[3fr_1fr_3fr]">
            <div className="space-y-2">
              <Label
                htmlFor={`${fieldIdPrefix}-employee`}
                className="text-sm leading-none font-medium"
              >
                {labels.EMPLOYEE_LABEL}{' '}
                <span className="text-teal-600">{labels.REQUIRED_MARK}</span>
              </Label>
              <Select
                value={draft.employeeId}
                onValueChange={(value) => onPatch(draft.id, { employeeId: value })}
                disabled={isSubmitting || needsRepair || isCompleted}
              >
                <SelectTrigger
                  id={`${fieldIdPrefix}-employee`}
                  className="h-11! w-full rounded-xl bg-white text-sm"
                >
                  <SelectValue
                    placeholder={
                      isLoadingEmployees
                        ? labels.EMPLOYEE_LOADING_PLACEHOLDER
                        : labels.EMPLOYEE_PLACEHOLDER
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={takenEmployeeIds.has(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employeeError && <p className="text-xs text-red-600">{employeeError}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${fieldIdPrefix}-target`}
                className="text-sm leading-none font-medium"
              >
                {labels.TARGET_LABEL}
              </Label>
              <InputGroup className="h-11! rounded-xl border-slate-300 bg-white">
                <InputGroupInput
                  id={`${fieldIdPrefix}-target`}
                  type="number"
                  min={0}
                  inputMode="decimal"
                  placeholder={labels.TARGET_PLACEHOLDER}
                  value={draft.targetQty}
                  disabled={isTargetLocked || isSubmitting || isCompleted}
                  aria-invalid={Boolean(targetError)}
                  onChange={(event) => onPatch(draft.id, { targetQty: event.target.value })}
                  className="text-sm"
                />
                {unit && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{unit}</InputGroupText>
                  </InputGroupAddon>
                )}
              </InputGroup>
              {targetError && <p className="text-xs text-red-600">{targetError}</p>}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`${fieldIdPrefix}-helpers`}
                className="text-sm leading-none font-medium"
              >
                {labels.HELPER_LABEL}
              </Label>
              {/* Same multi-select as project hierarchy → position's PIC field. */}
              <AsyncSelect
                id={`${fieldIdPrefix}-helpers`}
                isMulti
                options={helperOptions}
                value={draft.helperEmployeeIds}
                isDisabled={isSubmitting || isCompleted}
                isLoading={isLoadingEmployees}
                placeholder={labels.HELPER_PLACEHOLDER}
                isSearchable
                isClearable
                className="min-h-11 rounded-xl border-slate-300 bg-white text-sm"
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    onPatch(draft.id, { helperEmployeeIds: value });
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldIdPrefix}-note`} className="text-sm leading-none font-medium">
              {labels.NOTE_LABEL}
            </Label>
            <Textarea
              id={`${fieldIdPrefix}-note`}
              value={draft.note}
              onChange={(event) => onPatch(draft.id, { note: event.target.value })}
              disabled={isSubmitting || isCompleted}
              placeholder={labels.NOTE_PLACEHOLDER}
              className="min-h-24 rounded-xl border-slate-300 px-4 py-3 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface AssignPekerjaanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ManpowerPlanTreeItem | null;
  /**
   * `assign` (default) appends only the cards added this session, each `id: null`; `edit` submits
   * every card — existing ones with their project task id — through the same store/update endpoint.
   */
  mode?: 'assign' | 'edit';
  /** Called after a successful assign — the tree query is invalidated by the hook itself. */
  onAssigned?: () => void;
}

export function AssignPekerjaanDialog({
  open,
  onOpenChange,
  item,
  mode = 'assign',
  onAssigned,
}: AssignPekerjaanDialogProps) {
  const labels = MANPOWER_PLAN_LABELS.ASSIGN_PEKERJAAN;
  const isEditMode = mode === 'edit';

  const [drafts, setDrafts] = useState<ManpowerCardDraft[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  /** A card reveals its field errors once the user edits it — see the fieldErrors memo. */
  const [touchedCardIds, setTouchedCardIds] = useState<string[]>([]);

  const { data: employees, isLoading: isLoadingEmployees } = useSubordinateEmployees('work');
  const { mutate: assignLeafManpower, isPending: isSubmitting } = useAssignLeafManpower();

  const boqItemId = open ? (item?.id ?? null) : null;
  const { data: detail, isLoading: isLoadingDetail } = useManpowerAssignment(boqItemId);

  /** One seed per open session — a background refetch must not clobber in-progress edits. */
  const seededBoqItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      seededBoqItemIdRef.current = null;
      setDrafts([]);
      setExpandedIds([]);
      setTouchedCardIds([]);
      return;
    }

    if (!detail) return;
    if (seededBoqItemIdRef.current === detail.boqItemId) return;
    seededBoqItemIdRef.current = detail.boqItemId;

    // Seeded cards carry yesterday's manpowers (incl. needsRepair ones the user can adjust but
    // not delete); a leaf with no history starts from a single empty card.
    const seeded: ManpowerCardDraft[] = detail.manpowers.map((card) => ({
      id: nextDraftId(),
      detailCardId: card.id,
      employeeId: card.employee.id,
      targetQty: String(card.targetQty),
      helperEmployeeIds: card.helpers.map((helper) => helper.id),
      note: card.note ?? '',
    }));
    const next = seeded.length > 0 ? seeded : [createEmptyDraft()];

    setDrafts(next);
    setExpandedIds([next[0].id]);
    setTouchedCardIds([]);
  }, [open, detail]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]
    );
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts((previous) => previous.filter((draft) => draft.id !== id));
    setTouchedCardIds((previous) => previous.filter((value) => value !== id));
    setExpandedIds((previous) => previous.filter((value) => value !== id));
  }, []);

  const patchDraft = useCallback((id: string, patch: ManpowerCardDraftPatch) => {
    setDrafts((previous) =>
      previous.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
    setTouchedCardIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }, []);

  const addDraft = useCallback(() => {
    const draft = createEmptyDraft();
    setDrafts((previous) => [...previous, draft]);
    setExpandedIds((previous) => [...previous, draft.id]);
  }, []);

  // ── Derived summary + validation ──

  const volume = detail?.volumeBoq ?? null;
  const achievedQty = detail?.achievedQty ?? 0;

  const numericCards = useMemo(
    () => drafts.map((draft) => ({ targetQty: Number(draft.targetQty) || 0 })),
    [drafts]
  );
  const totalAssignedQty = useMemo(() => computeTotalAssignedQty(numericCards), [numericCards]);
  const isOverVolume = volume !== null && totalAssignedQty + achievedQty > volume.value;

  const detailCardsById = useMemo(
    () => new Map((detail?.manpowers ?? []).map((card) => [card.id, card])),
    [detail]
  );

  /** Subordinates first, then employees already on the item's existing cards merged in. */
  const employeeOptions = useMemo<EmployeeOption[]>(() => {
    const options: EmployeeOption[] = (employees ?? []).map((employee) => ({
      value: employee.id,
      label: employee.fullName,
    }));

    for (const card of detail?.manpowers ?? []) {
      const seededOptions: EmployeeOption[] = [
        { value: card.employee.id, label: card.employee.fullName },
        ...card.helpers.map((helper) => ({ value: helper.id, label: helper.fullName })),
      ];
      for (const option of seededOptions) {
        if (!options.some((existing) => existing.value === option.value)) {
          options.push(option);
        }
      }
    }

    return options;
  }, [employees, detail]);

  const validation = useMemo(() => {
    if (drafts.length === 0) return null;
    return assignPekerjaanSchema.safeParse({
      manpowers: drafts.map((draft) => ({
        employeeId: draft.employeeId,
        targetQty: draft.targetQty,
        helperEmployeeIds: draft.helperEmployeeIds,
        note: draft.note || undefined,
      })),
    });
  }, [drafts]);

  const fieldErrorsByCardIndex = useMemo(() => {
    const map: Record<number, ManpowerCardFieldErrors> = {};
    if (!validation || validation.success) return map;

    for (const issue of validation.error.issues) {
      const cardIndex = issue.path[0];
      const field = issue.path[1];
      if (typeof cardIndex !== 'number' || typeof field !== 'string') continue;
      if (field !== 'employeeId' && field !== 'targetQty') continue;
      map[cardIndex] = { ...map[cardIndex], [field]: issue.message };
    }

    return map;
  }, [validation]);

  const isTargetInputDisabled = (index: number) =>
    volume !== null && isTargetDisabled(index, numericCards, volume.value, achievedQty);

  /**
   * Cards reaching the payload: assign mode sends only the cards appended this session
   * (`detailCardId === null`, `id: null`); edit mode sends every card — existing ones carry their
   * project task id (see `handleSubmit`). `index` maps each entry back onto its `validation.data`
   * slot, which stays index-parallel with all drafts.
   */
  const draftsToSend = useMemo(
    () =>
      drafts
        .map((draft, index) => ({ draft, index }))
        .filter(({ draft }) => isEditMode || draft.detailCardId === null),
    [drafts, isEditMode]
  );

  const handleSubmit = () => {
    if (!item || !detail) return;

    // The Assign button is disabled while invalid, so this only guards a click that slipped
    // through (e.g. a race with the derived state) — reveal the errors instead of submitting.
    if (!validation?.success) {
      setTouchedCardIds(drafts.map((draft) => draft.id));
      return;
    }

    // Same store/update endpoint for both modes. Assign mode: only the cards added this session go
    // out, `id: null` each — the endpoint appends them (locked decision #4, wire sample shows
    // duplicated identical pairs), never replacing existing cards. Edit mode: every card is sent
    // with `id` — existing cards carry their project task id (update), appended ones stay `null`
    // (create). Validation above still covers every draft, so an invalid seeded card blocks submit.
    // TODO(backend): confirm the append (never-replace) semantics for `id: null` cards in edit mode.
    assignLeafManpower(
      {
        boqItemId: item.id,
        manpowers: draftsToSend.map(({ draft, index }) => ({
          id: isEditMode ? draft.detailCardId : null,
          ...validation.data.manpowers[index],
        })),
      },
      {
        onSuccess: () => {
          toast.success({ title: isEditMode ? labels.SUCCESS_TOAST_EDIT : labels.SUCCESS_TOAST });
          onOpenChange(false);
          onAssigned?.();
        },
        onError: (error) => {
          toast.error({ title: getErrorMessage(error) });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 gap-1 border-b border-slate-200 p-5 pt-8">
          <DialogTitle className="text-lg leading-none font-semibold text-slate-950">
            {labels.TITLE}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            {item ? labels.SUBTITLE(item.code, item.name) : labels.EMPTY}
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">{labels.DURATION_LABEL}</p>
              <p className="text-sm font-medium text-slate-950">
                {isLoadingDetail
                  ? labels.LOADING_PLACEHOLDER
                  : labels.DURATION_VALUE(detail?.duration ?? null)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{labels.VOLUME_LABEL}</p>
              <p className="text-sm font-medium text-slate-950">
                {volume ? `${volume.value} ${volume.unit}` : labels.LOADING_PLACEHOLDER}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{labels.PROGRESS_LABEL}</p>
              <p className="text-sm font-medium text-slate-950">
                {volume
                  ? `${achievedQty}/${volume.value} ${volume.unit}`
                  : labels.LOADING_PLACEHOLDER}
              </p>
            </div>
          </div>

          <Alert variant="warning">
            <AlertTitle className="font-semibold text-amber-600">{labels.WARNING_TITLE}</AlertTitle>
            <AlertDescription className="text-amber-600">{labels.WARNING_BODY}</AlertDescription>
          </Alert>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              {labels.LOADING}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {drafts.map((draft, index) => {
                  const detailCard = draft.detailCardId
                    ? detailCardsById.get(draft.detailCardId)
                    : undefined;
                  const isTargetLocked = isTargetInputDisabled(index);
                  const cardErrors = touchedCardIds.includes(draft.id)
                    ? fieldErrorsByCardIndex[index]
                    : undefined;

                  return (
                    <ManpowerCardEditor
                      key={draft.id}
                      index={index}
                      draft={draft}
                      isExpanded={expandedIds.includes(draft.id)}
                      needsRepair={detailCard?.needsRepair ?? false}
                      isCompleted={detailCard?.isCompleted ?? false}
                      // Edit mode: existing cards have no delete endpoint, so their trash locks.
                      isDeletable={!detailCard || (!isEditMode && isCardDeletable(detailCard))}
                      deleteDisabledTooltip={
                        isEditMode && detailCard
                          ? labels.DELETE_EXISTING_TOOLTIP
                          : labels.DELETE_DISABLED_TOOLTIP
                      }
                      isTargetLocked={isTargetLocked}
                      showVolumeFullAlert={isTargetLocked && isDraftEmpty(draft)}
                      unit={volume?.unit ?? ''}
                      employeeOptions={employeeOptions}
                      helperOptions={employeeOptions.filter(
                        (option) => option.value !== draft.employeeId
                      )}
                      takenEmployeeIds={computeTakenEmployeeIds(
                        drafts
                          .filter((other) => other.id !== draft.id)
                          .map((other) => ({
                            employeeId: other.employeeId,
                            // A rejected (Perlu Perbaikan) other card frees its employee for a
                            // fresh assignment here; non-rejected cards keep them locked.
                            isRejected: Boolean(
                              other.detailCardId &&
                                detailCardsById.get(other.detailCardId)?.needsRepair
                            ),
                          }))
                      )}
                      employeeError={cardErrors?.employeeId}
                      targetError={cardErrors?.targetQty}
                      isSubmitting={isSubmitting}
                      isLoadingEmployees={isLoadingEmployees}
                      onToggleExpanded={toggleExpanded}
                      onDelete={deleteDraft}
                      onPatch={patchDraft}
                    />
                  );
                })}
              </div>

              <Button
                type="button"
                variant="ghost"
                className="h-auto w-fit px-0! text-sm font-medium text-teal-600 hover:bg-transparent hover:text-teal-700"
                disabled={isSubmitting}
                onClick={addDraft}
              >
                <Plus />
                {labels.ADD_MANPOWER}
              </Button>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-t border-slate-200 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{labels.TOTAL_MANPOWER(drafts.length)}</span>
            <span className={cn('font-medium', isOverVolume ? 'text-red-600' : 'text-slate-950')}>
              {volume
                ? labels.TOTAL_QTY(totalAssignedQty, volume.value, volume.unit)
                : labels.LOADING_PLACEHOLDER}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-300 text-sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              {labels.CANCEL}
            </Button>
            <Button
              type="button"
              className="h-11 rounded-xl bg-teal-600 text-sm text-white hover:bg-teal-700"
              disabled={
                !validation?.success || isOverVolume || isSubmitting || draftsToSend.length === 0
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? labels.SUBMITTING : isEditMode ? labels.SUBMIT_EDIT : labels.SUBMIT}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
