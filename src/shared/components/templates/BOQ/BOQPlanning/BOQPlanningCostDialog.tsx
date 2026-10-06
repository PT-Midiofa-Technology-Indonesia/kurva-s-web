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
import { cn } from '@/shared/utils/cn';
import {
  appendRow,
  cloneRow,
  deleteRow,
  insertRow,
  updateRow,
} from '../BOQTemplate/boq-cost.utils';
import { resolveNameHeader } from '../types/boq-cost.types';
import type { BOQCostColumnLabels, BOQCostDialogLabels } from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQCostContextMenuItems } from '../utils/BOQCostContextMenu';
import type {
  BOQPlanningCostRow,
  BOQPlanningCostSection,
  CostSectionError,
} from './boq-planning-cost.types';
import { createEmptyPlanningCostRow } from './boq-planning-cost.types';
import { createBOQPlanningCostColumns } from './boq-planning-cost-columns';

const DEFAULT_DIALOG_LABELS: BOQCostDialogLabels = {
  detailTitle: 'Detail',
  lockedTooltip: (label: string) => `${label} tidak dapat diubah!`,
  saveButton: 'Simpan',
  savingButton: 'Menyimpan...',
};

export interface BOQPlanningCostDialogProps {
  node: BOQNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: BOQPlanningCostSection[];
  onSectionRowsChange: (sectionValue: string, rows: BOQPlanningCostRow[]) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  readOnly?: boolean;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
  /** Per-section errors from BE validation, keyed by section value */
  sectionErrors?: Record<string, CostSectionError>;
}

function PlanningCostSection({
  section,
  clipboardRef,
  onRowsChange,
  readOnly = false,
  labels,
  contextMenuContainer,
  popoverContainer,
  sectionError,
}: {
  section: BOQPlanningCostSection;
  clipboardRef: React.MutableRefObject<BOQPlanningCostRow | null>;
  onRowsChange: (rows: BOQPlanningCostRow[]) => void;
  readOnly?: boolean;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
  contextMenuContainer?: HTMLElement | null;
  popoverContainer?: HTMLElement | null;
  sectionError?: CostSectionError;
}) {
  const {
    value,
    label,
    rows,
    disabled = false,
    nameAsyncSelect,
    uomAsyncSelect,
    durationUomAsyncSelect,
  } = section;
  const effectiveDisabled = disabled || readOnly;
  const [search, setSearch] = useState('');
  const nameHeader = resolveNameHeader(value, section.nameHeader);
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };

  const filteredRows = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
  }, [rows, search]);

  // Exclude already-selected catalog items from name async-select suggestions
  const filteredNameAsyncSelect = useMemo(() => {
    if (!nameAsyncSelect) return undefined;
    const selectedIds = new Set(rows.map((r) => r.catalogId).filter(Boolean) as string[]);
    if (selectedIds.size === 0) return nameAsyncSelect;
    return {
      ...nameAsyncSelect,
      options: nameAsyncSelect.options.filter((opt) => !selectedIds.has(opt.value)),
    };
  }, [nameAsyncSelect, rows]);

  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQPlanningCostColumns({
        sectionValue: value,
        nameHeader,
        disabled: effectiveDisabled,
        nameCombobox: section.nameCombobox,
        nameAsyncSelect: filteredNameAsyncSelect,
        uomAsyncSelect,
        durationUomAsyncSelect,
        labels: labels?.columns,
        readOnlyColumns: section.readOnlyColumns,
      }),
    [
      value,
      nameHeader,
      effectiveDisabled,
      section.nameCombobox,
      filteredNameAsyncSelect,
      uomAsyncSelect,
      durationUomAsyncSelect,
      labels?.columns,
      section.readOnlyColumns,
    ]
  );

  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, val: unknown) => {
      const target = filteredRows[rowIndex];
      if (!target) return;
      if (columnId === 'code') {
        onRowsChange(updateRow(rows, target.id, { code: String(val ?? '') }));
      } else if (columnId === 'name') {
        if (section.nameAsyncSelect) {
          const catalogId = String(val ?? '');
          const found = section.nameAsyncSelect.getItemById(catalogId);
          if (found) {
            const updates: Partial<BOQPlanningCostRow> = {
              catalogId,
              code: found.code,
              name: found.name,
              uomId: found.uom?.id,
              uomLabel: found.uom?.name,
              satuan: found.uom?.name,
            };
            // Auto-set price for material/equipment (has unitPrice), skip manpower
            if ('unitPrice' in found && typeof found.unitPrice === 'number') {
              updates.hargaSatuan = found.unitPrice;
            }
            onRowsChange(updateRow(rows, target.id, updates));
          }
        } else {
          onRowsChange(updateRow(rows, target.id, { name: String(val ?? '') }));
        }
      } else if (columnId === 'vol_rab') {
        onRowsChange(
          updateRow(rows, target.id, {
            vol: val !== '' && val != null ? Number(val) : undefined,
          })
        );
      } else if (columnId === 'durasi_sewa_rab') {
        onRowsChange(
          updateRow(rows, target.id, {
            durasiSewa: val !== '' && val != null ? Number(val) : undefined,
          })
        );
      } else if (columnId === 'harga_satuan_rab') {
        onRowsChange(
          updateRow(rows, target.id, {
            hargaSatuan: val !== '' && val != null ? Number(val) : undefined,
          })
        );
      } else if (columnId === 'keterangan') {
        onRowsChange(
          updateRow(rows, target.id, {
            keterangan: val !== '' && val != null ? String(val) : undefined,
          })
        );
      } else if (columnId === 'satuan') {
        const uomId = String(val ?? '');
        const found = uomAsyncSelect?.getItemById(uomId);
        onRowsChange(
          updateRow(rows, target.id, {
            uomId,
            uomLabel: found?.label,
            satuan: found?.label,
          })
        );
      } else if (columnId === 'durationUoM') {
        const uomId = String(val ?? '');
        const found = (durationUomAsyncSelect ?? uomAsyncSelect)?.getItemById(uomId);
        onRowsChange(
          updateRow(rows, target.id, {
            durationUomId: uomId,
            durationUomLabel: found?.label,
            durationUoM: found?.label,
          })
        );
      }
    },
    [
      filteredRows,
      rows,
      onRowsChange,
      section.nameAsyncSelect,
      uomAsyncSelect,
      durationUomAsyncSelect,
    ]
  );

  const handleTambah = () => {
    if (disabled) return;
    onRowsChange(appendRow(rows, createEmptyPlanningCostRow()));
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
            {!readOnly && addControl}
          </div>

          <DataTable<BOQPlanningCostRow, unknown>
            columns={columns}
            headerColumnTree={headerColumnTree}
            data={filteredRows}
            getRowId={(row) => row.id}
            enablePagination={false}
            enableColumnDnd={false}
            enableColumnResize={false}
            enableRangeSelection={!effectiveDisabled}
            enableFooter={true}
            stickyHeader
            onCellEdit={effectiveDisabled ? undefined : handleCellEdit}
            emptyMessage="Belum ada data"
            contextMenuContainer={contextMenuContainer}
            popoverContainer={popoverContainer}
            contextMenu={
              effectiveDisabled
                ? undefined
                : (tableRow, options) => {
                    const row = tableRow.original;
                    return (
                      <BOQCostContextMenuItems
                        row={row}
                        canPaste={clipboardRef.current != null}
                        triggerCopy={options?.triggerCopy}
                        onCut={(r) => {
                          clipboardRef.current = cloneRow(r as BOQPlanningCostRow);
                          onRowsChange(deleteRow(rows, r.id));
                        }}
                        onCopy={(r) => {
                          clipboardRef.current = cloneRow(r as BOQPlanningCostRow);
                        }}
                        onPaste={(r) => {
                          if (clipboardRef.current) {
                            onRowsChange(
                              insertRow(rows, r.id, 'below', cloneRow(clipboardRef.current))
                            );
                            clipboardRef.current = null;
                          }
                        }}
                        onInsertAbove={(r) =>
                          onRowsChange(insertRow(rows, r.id, 'above', createEmptyPlanningCostRow()))
                        }
                        onInsertBelow={(r) =>
                          onRowsChange(insertRow(rows, r.id, 'below', createEmptyPlanningCostRow()))
                        }
                        onDelete={(r) => onRowsChange(deleteRow(rows, r.id))}
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

export function BOQPlanningCostDialog({
  node,
  open,
  onOpenChange,
  sections,
  onSectionRowsChange,
  onSave,
  isSaving,
  isLoading,
  readOnly = false,
  labels,
  sectionErrors,
}: BOQPlanningCostDialogProps) {
  const clipboardRef = useRef<BOQPlanningCostRow | null>(null);
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };

  const [isDirty, setIsDirty] = useState(false);
  const prevIsSaving = useRef(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const handleCloseClick = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      const fullscreenElement = document.fullscreenElement;
      setPortalContainer(fullscreenElement instanceof HTMLElement ? fullscreenElement : null);
    } else {
      setPortalContainer(null);
      clipboardRef.current = null;
      setIsDirty(false);
    }
  }, [open]);

  // Reset dirty after a successful save (isSaving transitions true → false)
  useEffect(() => {
    if (prevIsSaving.current && !isSaving) setIsDirty(false);
    prevIsSaving.current = !!isSaving;
  }, [isSaving]);

  const handleSectionRowsChange = useCallback(
    (sectionValue: string, rows: BOQPlanningCostRow[]) => {
      setIsDirty(true);
      onSectionRowsChange(sectionValue, rows);
    },
    [onSectionRowsChange]
  );

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
                variant={'outline'}
                onClick={onSave}
                disabled={isSaving}
                className="shrink-0"
                leftIcon={<Save />}
              >
                {isSaving ? dialogLabels.savingButton : dialogLabels.saveButton}
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
                <PlanningCostSection
                  key={section.value}
                  section={section}
                  clipboardRef={clipboardRef}
                  readOnly={readOnly}
                  labels={labels}
                  contextMenuContainer={portalContainer}
                  popoverContainer={portalContainer}
                  sectionError={sectionErrors?.[section.value]}
                  onRowsChange={(rows) => handleSectionRowsChange(section.value, rows)}
                />
              ))}
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
