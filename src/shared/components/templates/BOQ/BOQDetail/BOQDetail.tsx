'use client';

import type { ExpandedState } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { BOQDetailRow } from '@/domains/project-control/types/boq-detail';
import { Input } from '@/shared/components/atoms/Input';
import { DataTable } from '@/shared/components/organisms/DataTable';
import type { BOQDetailLabels, BOQDetailProps } from './boq-detail.types';
import {
  createBOQDetailColumns,
  createBOQDetailHeaderColumnTree,
  createBOQDetailSingleAmountColumns,
} from './boq-detail-columns';

const DEFAULT_LABELS: BOQDetailLabels = {
  title: 'Detail Project',
  searchPlaceholder: 'Pencarian',
  emptyMessage: 'Belum ada data',
  kode: 'Kode',
  viewCost: 'View Cost',
  jobItem: 'Job/Item',
  jenis: 'Jenis',
  volume: 'Volume',
  rab: 'RAB',
  cco: 'CCO',
  act: 'ACT',
  uom: 'UoM',
  amount: 'Amount',
  amountRab: 'RAB',
};

function filterTree(nodes: BOQDetailRow[], query: string): BOQDetailRow[] {
  const q = query.toLowerCase().trim();
  if (!q) return nodes;
  return nodes.reduce<BOQDetailRow[]>((acc, node) => {
    const selfMatch = node.name.toLowerCase().includes(q) || node.code.toLowerCase().includes(q);
    const filteredChildren = filterTree(node.children, query);
    if (selfMatch || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren });
    }
    return acc;
  }, []);
}

export function BOQDetail({
  value,
  search: externalSearch,
  onSearchChange,
  labels,
  contextMenu,
  isLoading,
  isError,
  backButton,
  titleExtra,
  showSingleAmount = true,
  onViewCost,
}: BOQDetailProps) {
  const l = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);

  const [internalSearch, setInternalSearch] = useState('');

  const search = externalSearch ?? internalSearch;

  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (onSearchChange) {
        onSearchChange(val);
      } else {
        setInternalSearch(val);
      }
    },
    [onSearchChange]
  );

  const filteredData = useMemo(() => filterTree(value, search), [value, search]);

  const columns = useMemo(
    () =>
      showSingleAmount
        ? createBOQDetailSingleAmountColumns(l, onViewCost)
        : createBOQDetailColumns(l, onViewCost),
    [l, showSingleAmount, onViewCost]
  );

  const headerTree = useMemo(
    () => createBOQDetailHeaderColumnTree(l, showSingleAmount),
    [l, showSingleAmount]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 py-10 text-center">Gagal memuat data BOQ.</div>;
  }

  return (
    <div className={`rounded-xl border bg-card p-4 shadow-sm`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {backButton}
          <h2 className="text-lg font-semibold">{l.title}</h2>
          {titleExtra}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={handleSearch}
            placeholder={l.searchPlaceholder}
            className="w-64 pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<BOQDetailRow, unknown>
        columns={columns}
        data={filteredData}
        headerColumnTree={headerTree}
        enableTreeView
        getSubRows={(r) => r.children}
        getRowId={(r) => r.id}
        expanded={expanded}
        onExpandedChange={setExpanded}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableRangeSelection={false}
        contextMenu={contextMenu}
        emptyMessage={l.emptyMessage}
      />
    </div>
  );
}
