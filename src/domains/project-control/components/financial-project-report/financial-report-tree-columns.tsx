'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui';
import { formatIDR } from '@/shared/utils/currency';
import type { FinancialReportItem } from '../../api/get-financial-report';
import {
  type FinancialReportViewMode,
  resolveAmountBaseline,
  resolveBudgetRemaining,
  resolveIsOverbudget,
  resolveTotalPriceMaterial,
  resolveTotalPriceWork,
} from '../../services/financial-report-view.service';

export interface CreateFinancialReportTreeColumnsOptions {
  viewMode: FinancialReportViewMode;
  onOpenCost: (item: FinancialReportItem) => void;
}

export interface CreateFinancialReportTreeColumnsResult {
  columns: ColumnDef<FinancialReportItem>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createFinancialReportTreeColumns({
  viewMode,
  onOpenCost,
}: CreateFinancialReportTreeColumnsOptions): CreateFinancialReportTreeColumnsResult {
  const baselineLabel = viewMode === 'rab' ? 'RAB' : 'CCO';

  const columns: ColumnDef<FinancialReportItem>[] = [
    {
      accessorKey: 'code',
      header: 'Kode',
      size: 110,
    },
    {
      id: 'viewCost',
      header: 'View Cost',
      cell: ({ row }) => {
        const item = row.original;
        if (!item.isFinalLevel) return null;
        return (
          <button
            type="button"
            className="flex items-center gap-1 text-primary cursor-pointer"
            onClick={() => onOpenCost(item)}
          >
            <Eye className="h-4 w-4" />
            <span>{item.itemCostCount}</span>
          </button>
        );
      },
      size: 90,
    },
    {
      accessorKey: 'name',
      header: 'Job/Item',
      size: 220,
    },
    {
      id: 'jenis',
      header: 'Jenis',
      cell: ({ row }) => <span>{row.original.jobItemType?.name ?? '-'}</span>,
      size: 120,
    },
    {
      id: 'total_price_material',
      header: 'Material',
      accessorFn: (row) => resolveTotalPriceMaterial(row, viewMode),
      cell: ({ row }) => (
        <span className="block w-full text-right">
          {formatIDR(resolveTotalPriceMaterial(row.original, viewMode))}
        </span>
      ),
      size: 130,
    },
    {
      id: 'total_price_work',
      header: 'Work',
      accessorFn: (row) => resolveTotalPriceWork(row, viewMode),
      cell: ({ row }) => (
        <span className="block w-full text-right">
          {formatIDR(resolveTotalPriceWork(row.original, viewMode))}
        </span>
      ),
      size: 130,
    },
    {
      id: 'amount_baseline',
      header: baselineLabel,
      accessorFn: (row) => resolveAmountBaseline(row, viewMode),
      cell: ({ row }) => (
        <span className="block w-full text-right">
          {formatIDR(resolveAmountBaseline(row.original, viewMode))}
        </span>
      ),
      size: 130,
    },
    {
      id: 'amount_cost_used',
      header: 'Cost (Used)',
      accessorFn: (row) => row.totalAmountActual,
      cell: ({ row }) => (
        <span className="block w-full text-right">{formatIDR(row.original.totalAmountActual)}</span>
      ),
      size: 130,
    },
    {
      id: 'amount_budget_remaining',
      header: 'Budget (Remaining)',
      accessorFn: (row) => resolveBudgetRemaining(row, viewMode),
      cell: ({ row }) => (
        <span className="block w-full text-right">
          {formatIDR(resolveBudgetRemaining(row.original, viewMode))}
        </span>
      ),
      size: 140,
    },
    {
      id: 'overbudget',
      header: 'Overbudget Item',
      cell: ({ row }) => {
        const isOverbudget = resolveIsOverbudget(row.original, viewMode);
        return (
          <Badge variant={isOverbudget ? 'destructive' : 'success'}>
            {isOverbudget ? 'Yes' : 'No'}
          </Badge>
        );
      },
      size: 120,
    },
  ];

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: 'Kode' },
    { id: 'viewCost', header: 'View Cost' },
    { id: 'name', header: 'Job/Item' },
    { id: 'jenis', header: 'Jenis' },
    {
      id: 'total_price',
      header: 'Total Price',
      children: [
        { id: 'total_price_material', header: 'Material' },
        { id: 'total_price_work', header: 'Work' },
      ],
    },
    {
      id: 'amount',
      header: 'Amount',
      children: [
        { id: 'amount_baseline', header: baselineLabel },
        { id: 'amount_cost_used', header: 'Cost (Used)' },
        { id: 'amount_budget_remaining', header: 'Budget (Remaining)' },
      ],
    },
    { id: 'overbudget', header: 'Overbudget Item' },
  ];

  return { columns, headerColumnTree };
}
