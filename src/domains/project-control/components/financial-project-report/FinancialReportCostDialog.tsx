'use client';

import { Download, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/shared/utils/currency';
import type { FinancialReportItem } from '../../api/get-financial-report';
import type { FinancialReportCostItem } from '../../api/get-financial-report-item-costs';
import { useExportFinancialReportItemCost } from '../../hooks/use-export-financial-report-item-cost';
import { useFinancialReportItemCosts } from '../../hooks/use-financial-report-item-costs';
import { computeFinancialReportCostFooterTotals } from '../../services/financial-report-view.service';
import { createFinancialReportCostColumns } from './financial-report-cost-columns';

export interface FinancialReportCostDialogProps {
  projectId: string;
  item: FinancialReportItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CostCategorySectionProps {
  category: string;
  categoryName: string;
  items: FinancialReportCostItem[];
}

function CostCategorySection({ category, categoryName, items }: CostCategorySectionProps) {
  const [search, setSearch] = useState('');
  const { columns, headerColumnTree } = useMemo(
    () => createFinancialReportCostColumns(category),
    [category]
  );

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return items;
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword)
    );
  }, [items, search]);

  const totals = useMemo(() => computeFinancialReportCostFooterTotals(items), [items]);

  return (
    <AccordionItem
      value={category}
      className="border-b py-2"
      data-testid={`cost-section-${category}`}
    >
      <AccordionTrigger className="py-2 text-left font-semibold">{categoryName}</AccordionTrigger>
      <AccordionContent className="py-2">
        <div className="space-y-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pencarian"
              className="pl-8"
            />
          </div>
          <DataTable<FinancialReportCostItem, unknown>
            columns={columns}
            headerColumnTree={headerColumnTree}
            data={filteredItems}
            getRowId={(row) => row.id}
            enablePagination={false}
            enableColumnDnd={false}
            enableColumnResize={false}
            enableRangeSelection={false}
            emptyMessage="Belum ada data"
          />
          <div className="flex items-center justify-end gap-6 border-t pt-2 text-sm font-semibold">
            <span>{formatIDR(totals.amountRab)}</span>
            <span>{formatIDR(totals.costUsed)}</span>
            <span>{formatIDR(totals.budgetRemaining)}</span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function FinancialReportCostDialog({
  projectId,
  item,
  open,
  onOpenChange,
}: FinancialReportCostDialogProps) {
  const { data, isLoading } = useFinancialReportItemCosts(projectId, item?.id, { enabled: open });
  const { isExporting, handleExport } = useExportFinancialReportItemCost(projectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] max-w-4xl! flex flex-col overflow-hidden"
      >
        <DialogHeader className="sticky top-0 z-10 flex-row items-center justify-between gap-2 space-y-0 border-b bg-popover pb-3">
          <DialogTitle>Penataan Data Binding</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Download />}
              disabled={!item || isExporting}
              onClick={() => item && handleExport(item.id, item.name)}
            >
              {isExporting ? 'Mengunduh...' : 'Export Excel'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
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
            <Accordion type="multiple" defaultValue={data?.costs.map((c) => c.category) ?? []}>
              {(data?.costs ?? []).map((category) => (
                <CostCategorySection
                  key={category.category}
                  category={category.category}
                  categoryName={category.categoryName}
                  items={category.items}
                />
              ))}
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
