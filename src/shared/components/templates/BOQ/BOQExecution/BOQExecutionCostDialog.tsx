'use client';

import { Plus, Save, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { appendRow, cloneRow, deleteRow, insertRow } from '../BOQTemplate/boq-cost.utils';
import type { BOQCostNameAsyncSelect, CostSectionError } from '../types/boq-cost.types';
import type { BOQCostColumnLabels, BOQCostDialogLabels } from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQCostContextMenuItems } from '../utils/BOQCostContextMenu';
import type { BOQExecutionCostRow, BOQExecutionCostSection } from './boq-execution-cost-columns';
import {
  createBOQExecutionCostColumns,
  createEmptyExecutionCostRow,
} from './boq-execution-cost-columns';

const DEFAULT_DIALOG_LABELS: BOQCostDialogLabels = {
  detailTitle: 'Detail',
  lockedTooltip: (_label: string) => `Tidak dapat diubah!`,
  saveButton: 'Simpan',
  savingButton: 'Menyimpan...',
};

/** Payload returned by dialog for unified save — mirrors SyncProjectBOQItemCostsPayload shape */
export interface BOQExecutionCostSavePayload {
  categories: {
    costCategory: string;
    items: {
      id?: string | null;
      catalogId?: string;
      code?: string;
      name?: string;
      volumeRab?: number | null;
      volumeCco?: number | null;
      volumeActual?: number | null;
      uomId?: string | null;
      durationRab?: number | null;
      durationCco?: number | null;
      durationActual?: number | null;
      durationUomId?: string | null;
      unitPriceRab?: number | null;
      unitPriceCco?: number | null;
      unitPriceActual?: number | null;
      remarks?: string | null;
    }[];
    deletedIds: string[];
  }[];
}

export interface BOQExecutionCostDialogProps {
  node: BOQNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: BOQExecutionCostSection[];
  isLoading?: boolean;
  /** Called with unified payload containing ALL dirty categories */
  onSave?: (payload: BOQExecutionCostSavePayload) => void;
  isSaving?: boolean;
  /** Per-category validation errors from BE */
  sectionErrors?: Record<string, CostSectionError>;
  /** Per-category name async-select config for material/equipment editing */
  nameAsyncSelects?: Record<string, BOQCostNameAsyncSelect>;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
}

function ExecutionCostSection({
  section,
  labels,
  popoverContainer,
  contextMenuContainer,
  nameAsyncSelect,
  onDirtyChange,
  onRegisterRowsGetter,
  sectionError,
}: {
  section: BOQExecutionCostSection;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
  popoverContainer?: HTMLElement | null;
  contextMenuContainer?: HTMLElement | null;
  nameAsyncSelect?: BOQCostNameAsyncSelect;
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterRowsGetter?: (getter: () => BOQExecutionCostRow[]) => () => void;
  sectionError?: CostSectionError;
}) {
  const { value, label, rows, editableSuffixes, disabled } = section;
  const [search, setSearch] = useState('');
  const [localRows, setLocalRows] = useState<BOQExecutionCostRow[]>(rows);
  const clipboardRef = useRef<BOQExecutionCostRow | null>(null);
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };
  const hasEdits = useMemo(
    () => JSON.stringify(localRows) !== JSON.stringify(rows),
    [localRows, rows]
  );

  // Stable ref for callback — avoids re-running effect on callback identity change
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;

  // Sync from parent when rows change externally
  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  // Report dirty state to parent (only re-runs on hasEdits change, not callback change)
  useEffect(() => {
    onDirtyChangeRef.current?.(hasEdits);
  }, [hasEdits]);

  // Register rows getter so dialog can read current rows for unified save
  useEffect(() => {
    if (!onRegisterRowsGetter) return;
    const unregister = onRegisterRowsGetter(() => localRows);
    return unregister;
  }, [localRows, onRegisterRowsGetter]);

  const filteredRows = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return localRows;
    return localRows.filter(
      (r) => r.code.toLowerCase().includes(k) || r.name.toLowerCase().includes(k)
    );
  }, [localRows, search]);

  // Exclude already-selected catalog items from name async-select suggestions
  const filteredNameAsyncSelect = useMemo(() => {
    if (!nameAsyncSelect) return undefined;
    const selectedIds = new Set(localRows.map((r) => r.catalogId).filter(Boolean) as string[]);
    if (selectedIds.size === 0) return nameAsyncSelect;
    return {
      ...nameAsyncSelect,
      options: nameAsyncSelect.options.filter((opt) => !selectedIds.has(opt.value)),
    };
  }, [nameAsyncSelect, localRows]);

  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQExecutionCostColumns({
        sectionValue: value,
        disabled: !editableSuffixes || editableSuffixes.size === 0,
        labels: labels?.columns,
        editableSuffixes,
        nameAsyncSelect: filteredNameAsyncSelect,
      }),
    [value, editableSuffixes, labels?.columns, filteredNameAsyncSelect]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQExecutionCostRow) => {
      if (!row) return;
      const numVal = val !== '' && val != null ? Number(val) : undefined;
      setLocalRows((prev) =>
        prev.map((r) => {
          if (r.id !== row.id) return r;

          if (columnId === 'name' && nameAsyncSelect) {
            const catalogId = String(val ?? '');
            const found = nameAsyncSelect.getItemById(catalogId);
            if (found) {
              return {
                ...r,
                catalogId,
                code: found.code,
                name: found.name,
                satuan: found.uom?.name ?? r.satuan,
                uomId: found.uom?.id ?? r.uomId,
              };
            }
          }
          if (columnId === 'vol_rab') return { ...r, vol_rab: numVal };
          if (columnId === 'vol_cco') return { ...r, vol_cco: numVal };
          if (columnId === 'vol_actual') return { ...r, vol_actual: numVal };
          if (columnId === 'durasi_sewa_rab') return { ...r, durasiSewa_rab: numVal };
          if (columnId === 'durasi_sewa_cco') return { ...r, durasiSewa_cco: numVal };
          if (columnId === 'durasi_sewa_actual') return { ...r, durasiSewa_actual: numVal };
          if (columnId === 'harga_satuan_rab') return { ...r, hargaSatuan_rab: numVal };
          if (columnId === 'harga_satuan_cco') return { ...r, hargaSatuan_cco: numVal };
          if (columnId === 'harga_satuan_actual') return { ...r, hargaSatuan_actual: numVal };
          if (columnId === 'keterangan')
            return { ...r, keterangan: val == null ? undefined : String(val) };

          return r;
        })
      );
    },
    [nameAsyncSelect]
  );

  const canEdit = editableSuffixes && editableSuffixes.size > 0;

  const handleTambah = () => {
    if (disabled) return;
    setLocalRows((prev) => appendRow(prev, createEmptyExecutionCostRow()));
  };

  const tambahButton = (
    <Button type="button" size="sm" disabled={disabled} onClick={handleTambah}>
      <Plus /> Tambah
    </Button>
  );

  const addControl = section.infoBadge ? (
    <Badge variant="secondary" className="text-xs font-normal">
      {section.infoBadge.message}
    </Badge>
  ) : disabled ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{tambahButton}</span>
        </TooltipTrigger>
        <TooltipContent>{dialogLabels.lockedTooltip(label)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    tambahButton
  );

  return (
    <AccordionItem value={value} className="border-b py-2" data-testid={`cost-section-${value}`}>
      <AccordionTrigger className="py-2 text-left font-semibold focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!border-transparent focus-visible:after:!border-transparent">
        {label}
      </AccordionTrigger>
      {/* h-auto! overrides the accordion's h-(--radix-accordion-content-height) clamp —
          otherwise the measured height goes stale when rows are added and the table gets
          clipped by the content's overflow-hidden instead of growing/scrolling. */}
      <AccordionContent className="py-2 h-auto!">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={section.searchPlaceholder ?? 'Pencarian'}
                className="pl-8"
              />
            </div>
            {canEdit && addControl}
          </div>

          <DataTable<BOQExecutionCostRow, unknown>
            columns={columns}
            headerColumnTree={headerColumnTree}
            data={filteredRows}
            getRowId={(row) => row.id}
            enablePagination={false}
            enableColumnDnd={false}
            enableColumnResize={false}
            enableRangeSelection={true}
            enableFooter={true}
            stickyHeader
            emptyMessage="Belum ada data"
            popoverContainer={popoverContainer}
            contextMenuContainer={contextMenuContainer}
            onCellEdit={canEdit ? handleCellEdit : undefined}
            contextMenu={
              !canEdit
                ? undefined
                : (tableRow, options) => {
                    const row = tableRow.original;
                    return (
                      <BOQCostContextMenuItems
                        row={row}
                        canPaste={clipboardRef.current != null}
                        triggerCopy={options?.triggerCopy}
                        onCut={(r) => {
                          clipboardRef.current = cloneRow(r as BOQExecutionCostRow);
                          setLocalRows((prev) => deleteRow(prev, r.id));
                        }}
                        onCopy={(r) => {
                          clipboardRef.current = cloneRow(r as BOQExecutionCostRow);
                        }}
                        onPaste={(r) => {
                          if (clipboardRef.current) {
                            setLocalRows((prev) =>
                              insertRow(prev, r.id, 'below', cloneRow(clipboardRef.current!))
                            );
                            clipboardRef.current = null;
                          }
                        }}
                        onInsertAbove={(r) =>
                          setLocalRows((prev) =>
                            insertRow(prev, r.id, 'above', createEmptyExecutionCostRow())
                          )
                        }
                        onInsertBelow={(r) =>
                          setLocalRows((prev) =>
                            insertRow(prev, r.id, 'below', createEmptyExecutionCostRow())
                          )
                        }
                        onDelete={(r) => setLocalRows((prev) => deleteRow(prev, r.id))}
                      />
                    );
                  }
            }
            className={cn(sectionError && 'border border-destructive')}
          />

          {/* Per-section validation errors */}
          {sectionError && (
            <div className="space-y-1">
              {sectionError.tableErrors.length > 0 &&
                sectionError.tableErrors.map((msg, i) => (
                  <p key={`t-${i}`} className="text-xs text-destructive">
                    {msg}
                  </p>
                ))}
              {Object.entries(sectionError.rowErrors).length > 0 && (
                <div className="text-xs text-destructive space-y-0.5">
                  {Object.entries(sectionError.rowErrors).map(([rowIdx, msgs]) =>
                    msgs.map((msg, i) => (
                      <p key={`r-${rowIdx}-${i}`} className="text-xs text-destructive">
                        Baris ke-{Number(rowIdx) + 1}: {msg}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function BOQExecutionCostDialog({
  node,
  open,
  onOpenChange,
  sections,
  isLoading,
  onSave,
  isSaving: isSavingProp = false,
  sectionErrors,
  nameAsyncSelects,
  labels,
}: BOQExecutionCostDialogProps) {
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Track dirty sections
  const dirtySectionsRef = useRef(new Set<string>());
  const [isDirty, setIsDirty] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);

  // Each section registers a getter that returns its current local rows
  const rowsGettersRef = useRef(new Map<string, () => BOQExecutionCostRow[]>());
  const saving = internalSaving || isSavingProp;

  // Reset dirty after a successful save (saving transitions true → false)
  const prevSaving = useRef(!!saving);
  useEffect(() => {
    if (prevSaving.current && !saving) {
      setIsDirty(false);
      dirtySectionsRef.current.clear();
    }
    prevSaving.current = !!saving;
  }, [saving]);

  const handleCloseClick = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      const fullscreenElement = document.fullscreenElement;
      setPortalContainer(fullscreenElement instanceof HTMLElement ? fullscreenElement : null);
    } else {
      setPortalContainer(null);
      dirtySectionsRef.current.clear();
      setIsDirty(false);
      rowsGettersRef.current.clear();
    }
  }, [open]);

  const handleDirtyChange = useCallback((sectionValue: string, dirty: boolean) => {
    if (dirty) {
      dirtySectionsRef.current.add(sectionValue);
    } else {
      dirtySectionsRef.current.delete(sectionValue);
    }
    setIsDirty(dirtySectionsRef.current.size > 0);
  }, []);

  const handleRegisterRowsGetter = useCallback(
    (sectionValue: string) => (getter: () => BOQExecutionCostRow[]) => {
      rowsGettersRef.current.set(sectionValue, getter);
      return () => {
        rowsGettersRef.current.delete(sectionValue);
      };
    },
    []
  );

  /** Build unified payload from ALL sections' current rows, then call parent onSave */
  const handleDialogSave = useCallback(() => {
    setInternalSaving(true);
    try {
      const categories: BOQExecutionCostSavePayload['categories'] = [];

      for (const section of sections) {
        const getter = rowsGettersRef.current.get(section.value);
        const currentRows = getter ? getter() : section.rows;

        // New rows (generated client-side) have no server id — send id: null so BE creates them
        const originalIds = new Set(section.rows.map((r) => r.id));
        const items = currentRows.map((row) => ({
          id: originalIds.has(row.id) ? row.id : null,
          catalogId: row.catalogId,
          code: row.code,
          name: row.name,
          volumeRab: row.vol_rab ?? null,
          volumeCco: row.vol_cco ?? null,
          volumeActual: row.vol_actual ?? null,
          uomId: row.uomId ?? null,
          durationRab: row.durasiSewa_rab ?? null,
          durationCco: row.durasiSewa_cco ?? null,
          durationActual: row.durasiSewa_actual ?? null,
          durationUomId: row.durationUomId ?? null,
          unitPriceRab: row.hargaSatuan_rab ?? null,
          unitPriceCco: row.hargaSatuan_cco ?? null,
          unitPriceActual: row.hargaSatuan_actual ?? null,
          remarks: row.keterangan ?? null,
        }));

        // Server ids missing from current rows → deleted
        const currentIds = new Set(currentRows.map((r) => r.id));
        const deletedIds = section.rows
          .filter((r) => originalIds.has(r.id) && !currentIds.has(r.id))
          .map((r) => r.id);

        if (items.length > 0 || deletedIds.length > 0) {
          categories.push({
            costCategory: section.value,
            items,
            deletedIds,
          });
        }
      }

      onSave?.({ categories });
    } finally {
      setInternalSaving(false);
    }
  }, [sections, onSave]);

  const backdrop = open ? (
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs" aria-hidden="true" />
  ) : null;
  const renderedBackdrop =
    portalContainer && backdrop ? createPortal(backdrop, portalContainer) : backdrop;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {renderedBackdrop}
      <DialogContent
        container={portalContainer}
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[85vh] sm:max-w-300 overflow-y-auto"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <DialogTitle>{node?.name || dialogLabels.detailTitle}</DialogTitle>
          <div className="flex items-center gap-2">
            {isDirty && onSave && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDialogSave}
                disabled={saving}
                className="shrink-0"
                leftIcon={<Save />}
              >
                {saving ? dialogLabels.savingButton : dialogLabels.saveButton}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="shrink-0"
              onClick={handleCloseClick}
            >
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Accordion type="multiple" defaultValue={sections.map((s) => s.value)}>
              {sections.map((section) => (
                <ExecutionCostSection
                  key={section.value}
                  section={section}
                  labels={labels}
                  popoverContainer={portalContainer}
                  contextMenuContainer={portalContainer}
                  nameAsyncSelect={nameAsyncSelects?.[section.value]}
                  onDirtyChange={(dirty) => handleDirtyChange(section.value, dirty)}
                  onRegisterRowsGetter={handleRegisterRowsGetter(section.value)}
                  sectionError={sectionErrors?.[section.value]}
                />
              ))}
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BOQExecutionCostDialog;
