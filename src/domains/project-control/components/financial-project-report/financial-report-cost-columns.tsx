'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui';
import { formatIDR } from '@/shared/utils/currency';
import type { FinancialReportCostItem } from '../../api/get-financial-report-item-costs';

function resolveNameHeader(category: string): string {
  if (category === 'equipment_cost') return 'Equipment Name';
  if (category === 'man_power_cost') return 'Job Title';
  return 'Nama Material';
}

function resolveUnitPriceHeader(category: string): string {
  return category === 'man_power_cost' ? 'Salary/h' : 'Unit Price';
}

export interface CreateFinancialReportCostColumnsResult {
  columns: ColumnDef<FinancialReportCostItem>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createFinancialReportCostColumns(
  category: string
): CreateFinancialReportCostColumnsResult {
  const nameHeader = resolveNameHeader(category);
  const unitPriceHeader = resolveUnitPriceHeader(category);

  const columns: ColumnDef<FinancialReportCostItem>[] = [
    { accessorKey: 'code', header: 'Kode', size: 90 },
    { accessorKey: 'name', header: nameHeader, size: 220 },
    {
      id: 'unitPriceRab',
      header: unitPriceHeader,
      accessorFn: (row) => row.unitPriceRab,
      cell: ({ row }) => (
        <span className="block w-full text-right">{formatIDR(row.original.unitPriceRab)}</span>
      ),
      size: 130,
    },
    {
      id: 'amountRab',
      header: 'RAB',
      accessorFn: (row) => row.amountRab,
      cell: ({ row }) => (
        <span className="block w-full text-right">{formatIDR(row.original.amountRab)}</span>
      ),
      size: 130,
    },
    {
      id: 'costUsed',
      header: 'Cost (Used)',
      accessorFn: (row) => row.costUsed,
      cell: ({ row }) => (
        <span className="block w-full text-right">{formatIDR(row.original.costUsed)}</span>
      ),
      size: 130,
    },
    {
      id: 'budgetRemaining',
      header: 'Budget (Remaining)',
      accessorFn: (row) => row.budgetRemaining,
      cell: ({ row }) => (
        <span className="block w-full text-right">{formatIDR(row.original.budgetRemaining)}</span>
      ),
      size: 140,
    },
    {
      id: 'isOverbudget',
      header: 'Overbudget Item',
      cell: ({ row }) => (
        <Badge variant={row.original.isOverbudget ? 'destructive' : 'success'}>
          {row.original.isOverbudget ? 'Yes' : 'No'}
        </Badge>
      ),
      size: 120,
    },
  ];

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: 'Kode' },
    { id: 'name', header: nameHeader },
    { id: 'unitPriceRab', header: unitPriceHeader },
    {
      id: 'amount',
      header: 'Amount',
      children: [
        { id: 'amountRab', header: 'RAB' },
        { id: 'costUsed', header: 'Cost (Used)' },
        { id: 'budgetRemaining', header: 'Budget (Remaining)' },
      ],
    },
    { id: 'isOverbudget', header: 'Overbudget Item' },
  ];

  return { columns, headerColumnTree };
}
