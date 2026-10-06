'use client';

import { format } from 'date-fns';
import { Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { DataTable } from '@/components/organisms/DataTable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/shared/components/molecules/DatePicker';
import { PROCUREMENT_LABELS } from '../constants';
import { useCreatePurchaseRequestManual } from '../hooks/use-create-purchase-request-manual';
import { usePurchaseRequestCostRows } from '../hooks/use-purchase-request-cost-rows';
import type {
  PurchaseRequestCostRow,
  PurchaseRequestCostSection,
} from '../types/purchase-request-cost-rows';
import { createPurchaseRequestManualColumns } from './purchase-request-manual-columns';

export interface PurchaseRequestManualDialogProps {
  boqItemId: string | null;
  itemName?: string | null;
  projectId: string;
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function PurchaseRequestManualDialog({
  boqItemId,
  itemName,
  projectId,
  companyId,
  open,
  onOpenChange,
  onCreated,
}: PurchaseRequestManualDialogProps) {
  const labels = PROCUREMENT_LABELS.PURCHASE_REQUEST.MANUAL_DIALOG;
  const { data, isLoading } = usePurchaseRequestCostRows(boqItemId, { enabled: open });
  const { mutateAsync, isPending } = useCreatePurchaseRequestManual();

  const [dateRequired, setDateRequired] = useState<Date>();
  const [sectionRows, setSectionRows] = useState<PurchaseRequestCostSection[]>([]);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) {
      setDateRequired(undefined);
      setSectionRows([]);
      setOpenSections([]);
      setCheckedIds({});
      return;
    }
    if (!data) return;
    setSectionRows(data.sections);
    setOpenSections(data.sections.map((_, i) => String(i)));
  }, [open, data]);

  const canSubmit = !!dateRequired && Object.values(checkedIds).some(Boolean);

  const handleSubmit = async () => {
    if (!canSubmit || !dateRequired) return;

    // Map snake_case API section types to camelCase contract types
    const mapSectionType = (type: string) => {
      if (type === 'material_tool') return 'materialTool';
      if (type === 'service_rental') return 'serviceRental';
      if (type === 'equipment_tool') return 'equipmentTool';
      return 'materialTool'; // fallback
    };

    const groupsMap = new Map<
      'materialTool' | 'serviceRental' | 'equipmentTool',
      { boqItemCostId: string; quantity: number; remarks?: string }[]
    >();

    Object.entries(checkedIds)
      .filter(([, v]) => v)
      .forEach(([id]) => {
        const section = sectionRows.find((s) => s.rows.some((r) => r.id === id));
        if (!section) return;

        const row = section.rows.find((r) => r.id === id)!;
        const mappedType = mapSectionType(section.type);

        if (!groupsMap.has(mappedType)) {
          groupsMap.set(mappedType, []);
        }
        groupsMap.get(mappedType)!.push({
          boqItemCostId: id,
          quantity: row.vol,
          remarks: row.remarks.trim() || undefined,
        });
      });

    const items = Array.from(groupsMap.entries()).map(([itemType, item]) => ({
      itemType,
      item,
    }));

    await mutateAsync({
      companyId,
      projectId,
      dateRequired: format(dateRequired, 'yyyy-MM-dd'),
      items,
    });
    onCreated?.();
    onOpenChange(false);
  };

  const onToggleRow = useCallback((rowId: string, checked: boolean) => {
    setCheckedIds((prev) => ({ ...prev, [rowId]: checked }));
  }, []);

  const onToggleSection = useCallback(
    (sectionIndex: number, checked: boolean) => {
      setCheckedIds((prev) => {
        const next = { ...prev };
        sectionRows[sectionIndex].rows.forEach((r) => {
          if (!r.disabled) next[r.id] = checked;
        });
        return next;
      });
    },
    [sectionRows]
  );

  const updateRow = useCallback(
    (sectionIndex: number, rowId: string, patch: Partial<PurchaseRequestCostRow>) => {
      setSectionRows((prev) => {
        const next = [...prev];
        next[sectionIndex] = {
          ...next[sectionIndex],
          rows: next[sectionIndex].rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
        };
        return next;
      });
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-300 overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <DialogTitle>{itemName ?? labels.FALLBACK_TITLE}</DialogTitle>
          <div className="flex items-center gap-2">
            <DatePicker
              mode="single"
              value={dateRequired ?? null}
              onChange={(value) => setDateRequired(value instanceof Date ? value : undefined)}
              placeholder={labels.DATE_REQUIRED_PLACEHOLDER}
              className="w-40"
            />
            <Button
              type="button"
              size="sm"
              leftIcon={<Save />}
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
            >
              {isPending ? labels.SUBMITTING : labels.SUBMIT}
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => onOpenChange(false)}>
              <X />
              <span className="sr-only">{labels.CLOSE}</span>
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <Accordion type="multiple" value={openSections} onValueChange={setOpenSections}>
            {sectionRows.map((section, index) => {
              const columns = createPurchaseRequestManualColumns({
                rows: section.rows,
                checkedIds,
                onToggleRow,
                onToggleSection: (checked) => onToggleSection(index, checked),
                labels: { remarks: labels.REMARKS, volEditHint: labels.VOL_EDIT_HINT },
              });
              return (
                <AccordionItem
                  key={section.type}
                  value={String(index)}
                  className="border-b py-2"
                  data-testid={`pr-manual-section-${section.type}`}
                >
                  <AccordionTrigger className="py-2 text-left font-semibold">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="py-2">
                    <DataTable<PurchaseRequestCostRow, unknown>
                      columns={columns}
                      data={section.rows}
                      getRowId={(row) => row.id}
                      enablePagination={false}
                      enableColumnDnd={false}
                      enableColumnResize={false}
                      enableRangeSelection
                      onCellEdit={(_rowIndex, columnId, val, row) => {
                        if (!row) return;
                        if (columnId === 'vol') {
                          const num = val !== '' && val != null ? Number(val) : 0;
                          const safe = Number.isNaN(num) ? 0 : Math.max(0, num);
                          updateRow(index, row.id, {
                            vol: safe,
                          });
                          return;
                        }
                        if (columnId === 'remarks') {
                          updateRow(index, row.id, {
                            remarks: String(val ?? ''),
                          });
                        }
                      }}
                      emptyMessage={labels.EMPTY}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PurchaseRequestManualDialog;
