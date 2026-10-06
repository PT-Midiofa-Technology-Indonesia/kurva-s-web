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
import type { BOQCostRow, BOQCostSection, CostSectionError } from '../types/boq-cost.types';
import { resolveNameHeader } from '../types/boq-cost.types';
import type { BOQCostColumnLabels, BOQCostDialogLabels } from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQCostContextMenuItems } from '../utils/BOQCostContextMenu';
import { appendRow, createEmptyRow, deleteRow, insertRow, updateRow } from './boq-cost.utils';
import { createBOQCostColumns } from './boq-cost-columns';

const DEFAULT_DIALOG_LABELS: BOQCostDialogLabels = {
  detailTitle: 'Detail',
  lockedTooltip: (label: string) => `${label} tidak dapat diubah!`,
  saveButton: 'Simpan',
  savingButton: 'Menyimpan...',
};

export interface BOQTemplateCostDialogProps {
  node: BOQNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: BOQCostSection[];
  onSectionRowsChange: (sectionValue: string, rows: BOQCostRow[]) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
  /** Per-section errors from BE validation, keyed by section value */
  sectionErrors?: Record<string, CostSectionError>;
}

function CostSection({
  section,
  clipboardRef,
  hasClipboard,
  onClipboardChange,
  onRowsChange,
  labels,
  popoverContainer,
  sectionError,
}: {
  section: BOQCostSection;
  clipboardRef: React.MutableRefObject<string | null>;
  hasClipboard: boolean;
  onClipboardChange: (has: boolean) => void;
  onRowsChange: (rows: BOQCostRow[]) => void;
  labels?: {
    dialog?: Partial<BOQCostDialogLabels>;
    columns?: Partial<BOQCostColumnLabels>;
  };
  popoverContainer?: HTMLElement | null;
  sectionError?: CostSectionError;
}) {
  const { value, label, rows, disabled = false } = section;
  const [search, setSearch] = useState('');
  const nameHeader = resolveNameHeader(value, section.nameHeader);
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };

  const filteredRows = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
  }, [rows, search]);

  const columns = useMemo(
    () =>
      createBOQCostColumns({
        nameHeader,
        disabled,
        nameCombobox: section.nameCombobox,
        nameAsyncSelect: section.nameAsyncSelect,
        labels: labels?.columns,
      }),
    [nameHeader, disabled, section.nameCombobox, section.nameAsyncSelect, labels?.columns]
  );

  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const target = filteredRows[rowIndex];
      if (!target) return;
      if (columnId === 'code') {
        onRowsChange(updateRow(rows, target.id, { code: String(value ?? '') }));
      } else if (columnId === 'name') {
        if (section.nameAsyncSelect) {
          const catalogId = String(value ?? '');
          const found = section.nameAsyncSelect.getItemById(catalogId);
          if (found) {
            onRowsChange(
              updateRow(rows, target.id, { catalogId, code: found.code, name: found.name })
            );
          }
        } else {
          onRowsChange(updateRow(rows, target.id, { name: String(value ?? '') }));
        }
      }
    },
    [filteredRows, rows, onRowsChange, section.nameAsyncSelect]
  );

  const handleTambah = () => {
    if (disabled) return;
    onRowsChange(appendRow(rows, createEmptyRow()));
  };

  const addControl = section.infoBadge ? (
    <Badge variant="secondary" className="text-xs font-normal">
      {section.infoBadge.message}
    </Badge>
  ) : disabled ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button type="button" size="sm" disabled={disabled} onClick={handleTambah}>
              <Plus /> Tambah
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{dialogLabels.lockedTooltip(label)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <Button type="button" size="sm" disabled={disabled} onClick={handleTambah}>
      <Plus /> Tambah
    </Button>
  );

  return (
    <AccordionItem
      value={value}
      className="border-b py-2 w-3xl"
      data-testid={`cost-section-${value}`}
    >
      <AccordionTrigger className="py-2 text-left font-semibold focus-visible:!ring-0 focus-visible:!ring-offset-0 focus-visible:!border-transparent focus-visible:after:!border-transparent">
        {label}
      </AccordionTrigger>
      <AccordionContent className="py-2">
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
            {addControl}
          </div>

          <div className="w-full overflow-x-auto">
            <DataTable<BOQCostRow, unknown>
              columns={columns}
              data={filteredRows}
              getRowId={(row) => row.id}
              enablePagination={false}
              enableColumnDnd={false}
              enableColumnResize={false}
              enableRangeSelection={!disabled}
              onCellEdit={disabled ? undefined : handleCellEdit}
              emptyMessage="Belum ada data"
              contextMenuContainer={popoverContainer}
              popoverContainer={popoverContainer}
              contextMenu={
                disabled
                  ? undefined
                  : (tableRow, options) => {
                      const row = tableRow.original;
                      const cellValue = String(options?.activeCellInfo?.value ?? '');
                      const columnId = options?.activeCellInfo?.columnId ?? '';
                      return (
                        <BOQCostContextMenuItems
                          row={row}
                          canPaste={hasClipboard}
                          onCut={() => {
                            clipboardRef.current = cellValue;
                            onClipboardChange(true);
                            if (columnId === 'code')
                              onRowsChange(updateRow(rows, row.id, { code: '' }));
                            else if (columnId === 'name')
                              onRowsChange(updateRow(rows, row.id, { name: '' }));
                            options?.triggerCut?.();
                          }}
                          onCopy={() => {
                            clipboardRef.current = cellValue;
                            onClipboardChange(true);
                            options?.triggerCopy?.();
                          }}
                          onPaste={() => {
                            const val = clipboardRef.current;
                            if (val == null || !columnId) return;
                            if (columnId === 'code')
                              onRowsChange(updateRow(rows, row.id, { code: val }));
                            else if (columnId === 'name')
                              onRowsChange(updateRow(rows, row.id, { name: val }));
                            clipboardRef.current = null;
                            onClipboardChange(false);
                            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                          }}
                          onInsertAbove={(r) =>
                            onRowsChange(insertRow(rows, r.id, 'above', createEmptyRow()))
                          }
                          onInsertBelow={(r) =>
                            onRowsChange(insertRow(rows, r.id, 'below', createEmptyRow()))
                          }
                          onDelete={(r) => onRowsChange(deleteRow(rows, r.id))}
                        />
                      );
                    }
              }
            />
          </div>

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

export function BOQTemplateCostDialog({
  node,
  open,
  onOpenChange,
  sections,
  onSectionRowsChange,
  onSave,
  isSaving,
  isLoading,
  labels,
  sectionErrors,
}: BOQTemplateCostDialogProps) {
  const clipboardRef = useRef<string | null>(null);
  const dialogLabels = { ...DEFAULT_DIALOG_LABELS, ...labels?.dialog };

  const [hasClipboard, setHasClipboard] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const prevIsSaving = useRef(false);

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
      setHasClipboard(false);
      setIsDirty(false);
    }
  }, [open]);

  // Reset dirty after a successful save (isSaving transitions true → false)
  useEffect(() => {
    if (prevIsSaving.current && !isSaving) setIsDirty(false);
    prevIsSaving.current = !!isSaving;
  }, [isSaving]);

  const handleSectionRowsChange = useCallback(
    (sectionValue: string, rows: BOQCostRow[]) => {
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
        className="max-h-[85vh] sm:max-w-200 overflow-y-auto overflow-x-hidden"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <DialogTitle>{node?.name || dialogLabels.detailTitle}</DialogTitle>
          <div>
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
          <Accordion type="multiple" defaultValue={sections.map((s) => s.value)}>
            {sections.map((section) => (
              <CostSection
                key={section.value}
                section={section}
                clipboardRef={clipboardRef}
                hasClipboard={hasClipboard}
                onClipboardChange={setHasClipboard}
                labels={labels}
                popoverContainer={portalContainer}
                sectionError={sectionErrors?.[section.value]}
                onRowsChange={(rows) => handleSectionRowsChange(section.value, rows)}
              />
            ))}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}
