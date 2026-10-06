'use client';

import type { ExpandedState } from '@tanstack/react-table';
import { Expand, Minimize2, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { formatIDR } from '@/shared/utils/currency';
import type { FinancialReportItem } from '../../api/get-financial-report';
import {
  computeFinancialReportFooterTotals,
  type FinancialReportViewMode,
} from '../../services/financial-report-view.service';
import { FinancialReportCostDialog } from './FinancialReportCostDialog';
import { createFinancialReportTreeColumns } from './financial-report-tree-columns';

export interface FinancialReportTreeProps {
  projectId: string;
  items: FinancialReportItem[];
}

function filterFinancialReportItems(
  items: FinancialReportItem[],
  keyword: string
): FinancialReportItem[] {
  if (!keyword) return items;
  return items.reduce<FinancialReportItem[]>((acc, item) => {
    const selfMatches =
      item.code.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword);
    const filteredChildren = filterFinancialReportItems(item.children, keyword);
    if (selfMatches || filteredChildren.length > 0) {
      acc.push({ ...item, children: filteredChildren });
    }
    return acc;
  }, []);
}

export function FinancialReportTree({ projectId, items }: FinancialReportTreeProps) {
  const { ref: containerRef, isFullscreen, toggleFullscreen } = useFullscreen<HTMLDivElement>();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<FinancialReportViewMode>('rab');
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [selectedItem, setSelectedItem] = useState<FinancialReportItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenCost = useCallback((item: FinancialReportItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);

  const { columns, headerColumnTree } = useMemo(
    () => createFinancialReportTreeColumns({ viewMode, onOpenCost: handleOpenCost }),
    [viewMode, handleOpenCost]
  );

  const filteredItems = useMemo(
    () => filterFinancialReportItems(items, search.toLowerCase().trim()),
    [items, search]
  );

  const footerTotals = useMemo(
    () => computeFinancialReportFooterTotals(items, viewMode),
    [items, viewMode]
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border bg-card p-4 shadow-sm${isFullscreen ? ' flex flex-col overflow-hidden' : ''}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Detail Project</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pencarian"
              className="w-64 pl-8"
            />
          </div>
          <Button
            type="button"
            variant={viewMode === 'rab' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('rab')}
          >
            By RAB
          </Button>
          <Button
            type="button"
            variant={viewMode === 'cco' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cco')}
          >
            By CCO
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className={isFullscreen ? 'flex-1 overflow-auto' : undefined}>
        <DataTable<FinancialReportItem, unknown>
          columns={columns}
          headerColumnTree={headerColumnTree}
          data={filteredItems}
          enableTreeView
          getSubRows={(row) => row.children}
          getRowId={(row) => row.id}
          expanded={expanded}
          onExpandedChange={setExpanded}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
          enableRangeSelection={false}
          stickyHeader
          emptyMessage="Belum ada data"
          contextMenuContainer={isFullscreen ? containerRef.current : undefined}
          popoverContainer={isFullscreen ? containerRef.current : undefined}
        />
        <div className="flex items-center justify-end gap-6 border-t px-4 py-2 text-sm font-semibold">
          <span>{formatIDR(footerTotals.amountBaseline)}</span>
          <span>{formatIDR(footerTotals.costUsed)}</span>
          <span>{formatIDR(footerTotals.budgetRemaining)}</span>
        </div>
      </div>

      <FinancialReportCostDialog
        projectId={projectId}
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
