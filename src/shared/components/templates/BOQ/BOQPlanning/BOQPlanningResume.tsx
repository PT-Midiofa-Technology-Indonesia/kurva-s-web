'use client';

import { Expand, Minimize2, SaveIcon, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BOQResumeColumnLabels, BOQResumeDialogLabels } from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';
import type {
  BOQResumeEquipmentRow,
  BOQResumeEquipmentSection,
  BOQResumeMaterialRow,
  BOQResumeMaterialSection,
} from './boq-resume.types';
import { applyEquipmentCellEdit, applyMaterialCellEdit } from './boq-resume.utils';
import {
  createBOQResumeEquipmentColumns,
  createBOQResumeMaterialColumns,
} from './boq-resume-columns';

const DEFAULT_DIALOG_LABELS: BOQResumeDialogLabels = {
  detailTitle: 'Detail',
  materialSectionTitle: 'Resume Material & Transportation Cost',
  equipmentSectionTitle: 'Resume Equipment Cost',
  searchPlaceholder: 'Pencarian',
};

export interface BOQPlanningResumeProps {
  node: BOQNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialSection: BOQResumeMaterialSection;
  equipmentSection: BOQResumeEquipmentSection;
  onMaterialRowsChange?: (rows: BOQResumeMaterialRow[]) => void;
  onEquipmentRowsChange?: (rows: BOQResumeEquipmentRow[]) => void;
  readOnly?: boolean;
  showVolumeCcoAct?: boolean;
  labels?: {
    dialog?: Partial<BOQResumeDialogLabels>;
    columns?: Partial<BOQResumeColumnLabels>;
  };
  onSave?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

/* ─── sub-sections ─── */

function MaterialSection({
  section,
  readOnly,
  searchPlaceholder,
  columnLabels,
  showVolumeCcoAct,
  onRowsChange,
}: {
  section: BOQResumeMaterialSection;
  readOnly: boolean;
  searchPlaceholder: string;
  columnLabels?: Partial<BOQResumeColumnLabels>;
  showVolumeCcoAct?: boolean;
  onRowsChange?: (rows: BOQResumeMaterialRow[]) => void;
}) {
  const [search, setSearch] = useState('');
  const { rows } = section;
  const filteredRows = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
  }, [rows, search]);
  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQResumeMaterialColumns({
        disabled: readOnly,
        labels: columnLabels,
        showVolumeCcoAct,
      }),
    [readOnly, columnLabels, showVolumeCcoAct]
  );
  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, val: unknown) => {
      const target = filteredRows[rowIndex];
      if (!target) return;
      const updated = applyMaterialCellEdit(target, columnId, val);
      if (updated === target) return;
      onRowsChange?.(rows.map((r) => (r === target ? updated : r)));
    },
    [filteredRows, rows, onRowsChange]
  );
  return (
    <div className="space-y-3 w-full">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={section.searchPlaceholder ?? searchPlaceholder}
          aria-label={section.searchPlaceholder ?? searchPlaceholder}
          className="pl-8"
        />
      </div>
      <DataTable<BOQResumeMaterialRow, unknown>
        columns={columns}
        headerColumnTree={headerColumnTree}
        data={filteredRows}
        getRowId={(row) => row.id}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableFooter
        enableRangeSelection={!readOnly}
        onCellEdit={readOnly ? undefined : handleCellEdit}
        emptyMessage="Belum ada data"
      />
    </div>
  );
}

function EquipmentSection({
  section,
  readOnly,
  searchPlaceholder,
  columnLabels,
  showVolumeCcoAct,
  onRowsChange,
}: {
  section: BOQResumeEquipmentSection;
  readOnly: boolean;
  searchPlaceholder: string;
  columnLabels?: Partial<BOQResumeColumnLabels>;
  showVolumeCcoAct?: boolean;
  onRowsChange?: (rows: BOQResumeEquipmentRow[]) => void;
}) {
  const [search, setSearch] = useState('');
  const { rows } = section;
  const filteredRows = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
  }, [rows, search]);
  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQResumeEquipmentColumns({
        disabled: readOnly,
        labels: columnLabels,
        showVolumeCcoAct,
      }),
    [readOnly, columnLabels, showVolumeCcoAct]
  );
  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, val: unknown) => {
      const target = filteredRows[rowIndex];
      if (!target) return;
      const updated = applyEquipmentCellEdit(target, columnId, val);
      if (updated === target) return;
      onRowsChange?.(rows.map((r) => (r === target ? updated : r)));
    },
    [filteredRows, rows, onRowsChange]
  );
  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={section.searchPlaceholder ?? searchPlaceholder}
          aria-label={section.searchPlaceholder ?? searchPlaceholder}
          className="pl-8"
        />
      </div>
      <DataTable<BOQResumeEquipmentRow, unknown>
        columns={columns}
        headerColumnTree={headerColumnTree}
        data={filteredRows}
        getRowId={(row) => row.id}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableFooter
        enableRangeSelection={!readOnly}
        onCellEdit={readOnly ? undefined : handleCellEdit}
        emptyMessage="Belum ada data"
      />
    </div>
  );
}

/* ─── fullscreen portal hook ─── */

function useFullscreenPortal() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const open = useCallback(() => {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;inset:0;z-index:999;background:#fff;display:flex;flex-direction:column;';
    document.body.appendChild(el);
    setContainer(el);
    el.requestFullscreen().catch(() => {
      // keep container visible as fallback
    });
  }, []);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setContainer((prev) => {
      prev?.parentNode?.removeChild(prev);
      return null;
    });
  }, []);

  useEffect(
    () => () => {
      container?.parentNode?.removeChild(container);
    },
    [container]
  );

  return { container, open, close };
}

/* ─── main component ─── */

export function BOQPlanningResume({
  node,
  open,
  onOpenChange,
  materialSection,
  equipmentSection,
  onMaterialRowsChange,
  onEquipmentRowsChange,
  readOnly = false,
  showVolumeCcoAct,
  labels,
  onSave,
  isSaving,
  hasChanges = true,
}: BOQPlanningResumeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { container: fsContainer, open: openFs, close: closeFs } = useFullscreenPortal();
  const dialogLabels = useMemo(
    () => ({ ...DEFAULT_DIALOG_LABELS, ...labels?.dialog }),
    [labels?.dialog]
  );

  // Track native fullscreen exit (Escape key)
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        closeFs();
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [isFullscreen, closeFs]);

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    onOpenChange(false); // close dialog first
    openFs(); // create temp DOM + requestFullscreen
  }, [onOpenChange, openFs]);

  const exitFullscreen = useCallback(() => {
    closeFs();
    setIsFullscreen(false);
  }, [closeFs]);

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const resumeAccordion = (
    <Accordion type="multiple" defaultValue={['material_transport', 'equipment']}>
      <AccordionItem value="material_transport" className="border-b py-2 w-full">
        <AccordionTrigger className="py-2 text-left font-semibold focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-transparent! focus-visible:after:border-transparent!">
          {dialogLabels.materialSectionTitle}
        </AccordionTrigger>
        <AccordionContent className="py-2">
          <MaterialSection
            section={materialSection}
            readOnly={readOnly}
            searchPlaceholder={dialogLabels.searchPlaceholder}
            columnLabels={labels?.columns}
            showVolumeCcoAct={showVolumeCcoAct}
            onRowsChange={onMaterialRowsChange}
          />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="equipment" className="border-b py-2 w-full">
        <AccordionTrigger className="py-2 text-left font-semibold focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:border-transparent! focus-visible:after:border-transparent!">
          {dialogLabels.equipmentSectionTitle}
        </AccordionTrigger>
        <AccordionContent className="py-2">
          <EquipmentSection
            section={equipmentSection}
            readOnly={readOnly}
            searchPlaceholder={dialogLabels.searchPlaceholder}
            columnLabels={labels?.columns}
            showVolumeCcoAct={showVolumeCcoAct}
            onRowsChange={onEquipmentRowsChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const toolbar = (
    <div className="flex items-center gap-2 shrink-0">
      {!readOnly && onSave && hasChanges && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<SaveIcon />}
          type="button"
          onClick={onSave}
          isLoading={isSaving}
        >
          Simpan
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="shrink-0"
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        <span className="sr-only">{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        className="shrink-0"
        onClick={isFullscreen ? exitFullscreen : handleClose}
      >
        <X />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );

  // Fullscreen: portal ke temporary DOM, native requestFullscreen
  if (isFullscreen && fsContainer) {
    return createPortal(
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {node?.name || dialogLabels.detailTitle}
          </h2>
          {toolbar}
        </div>
        <div className="flex-1 overflow-auto p-6">{resumeAccordion}</div>
      </div>,
      fsContainer
    );
  }

  // Normal: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs" aria-hidden="true" />
      )}
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] sm:max-w-300 overflow-hidden flex flex-col"
      >
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0 shrink-0">
          <DialogTitle>{node?.name || dialogLabels.detailTitle}</DialogTitle>
          {toolbar}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">{resumeAccordion}</div>
      </DialogContent>
    </Dialog>
  );
}

export default BOQPlanningResume;
