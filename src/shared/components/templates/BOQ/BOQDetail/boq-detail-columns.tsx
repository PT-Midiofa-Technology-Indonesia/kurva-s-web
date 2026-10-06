'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import type { BOQDetailRow } from '@/domains/project-control/types/boq-detail';
import type { HeaderColumnNode } from '@/shared/components/organisms/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { formatIDR } from '@/shared/utils/currency';
import type { BOQDetailLabels } from './boq-detail.types';

export function createBOQDetailColumns(
  labels?: BOQDetailLabels,
  onViewCost?: (row: BOQDetailRow) => void
): ColumnDef<BOQDetailRow>[] {
  const l = labels ?? {};

  return [
    {
      id: 'code',
      accessorKey: 'code',
      header: l.kode ?? 'Kode',
      size: 80,
    },
    {
      id: 'viewCost',
      header: l.viewCost ?? 'View Cost',
      size: 90,
      enableSorting: false,
      cell: ({ row }) => {
        if (!row.original.isFinalLevel) return null;
        const count = row.original.viewCostCount;
        return (
          <button
            type="button"
            onClick={() => onViewCost?.(row.original)}
            className="flex items-center gap-1 hover:opacity-70"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-600" />
            {count != null && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                {count}
              </Badge>
            )}
          </button>
        );
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: l.jobItem ?? 'Job/Item',
      size: 300,
    },
    {
      id: 'jenis',
      accessorKey: 'jenis',
      header: l.jenis ?? 'Jenis',
      size: 120,
    },
    {
      header: l.volume ?? 'Volume',
      columns: [
        {
          id: 'volumeRab',
          accessorKey: 'volumeRab',
          header: l.rab ?? 'RAB',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'volumeCco',
          accessorKey: 'volumeCco',
          header: l.cco ?? 'CCO',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'volumeActual',
          accessorKey: 'volumeActual',
          header: l.act ?? 'ACT',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'uomName',
          accessorKey: 'uomName',
          header: l.uom ?? 'UoM',
          size: 60,
        },
      ],
    },
    {
      header: l.amount ?? 'Amount',
      columns: [
        {
          id: 'amountRab',
          accessorKey: 'amountRab',
          header: l.amountRab ?? 'RAB',
          size: 120,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? formatIDR(val) : '';
          },
        },
      ],
    },
  ];
}

export function createBOQDetailSingleAmountColumns(
  labels?: BOQDetailLabels,
  onViewCost?: (row: BOQDetailRow) => void
): ColumnDef<BOQDetailRow>[] {
  const l = labels ?? {};

  return [
    {
      id: 'code',
      accessorKey: 'code',
      header: l.kode ?? 'Kode',
      size: 80,
    },
    {
      id: 'viewCost',
      header: l.viewCost ?? 'View Cost',
      size: 90,
      enableSorting: false,
      cell: ({ row }) => {
        if (!row.original.isFinalLevel) return null;
        const count = row.original.viewCostCount;
        return (
          <button
            type="button"
            onClick={() => onViewCost?.(row.original)}
            className="flex items-center gap-1 hover:opacity-70"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-600" />
            {count != null && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                {count}
              </Badge>
            )}
          </button>
        );
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: l.jobItem ?? 'Job/Item',
      size: 300,
    },
    {
      id: 'jenis',
      accessorKey: 'jenis',
      header: l.jenis ?? 'Jenis',
      size: 120,
    },
    {
      header: l.volume ?? 'Volume',
      size: 120,
      columns: [
        {
          id: 'volumeRab',
          accessorKey: 'volumeRab',
          header: l.rab ?? 'RAB',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'volumeCco',
          accessorKey: 'volumeCco',
          header: l.cco ?? 'CCO',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'volumeActual',
          accessorKey: 'volumeActual',
          header: l.act ?? 'ACT',
          size: 80,
          cell: ({ getValue }) => {
            const val = getValue() as number | null | undefined;
            return val != null ? val.toLocaleString('id-ID') : '';
          },
        },
        {
          id: 'uomName',
          accessorKey: 'uomName',
          header: l.uom ?? 'UoM',
          size: 60,
        },
      ],
    },
    {
      id: 'amountRab',
      accessorKey: 'amountRab',
      header: l.amountRab ?? 'RAB',
      size: 120,
      cell: ({ getValue }) => {
        const val = getValue() as number | null | undefined;
        return val != null ? formatIDR(val) : '';
      },
    },
  ];
}

export function createBOQDetailHeaderColumnTree(
  labels?: BOQDetailLabels,
  showSingleAmount?: boolean
): HeaderColumnNode[] {
  const l = labels ?? {};
  const isSingle = showSingleAmount ?? true;
  return [
    { id: 'code', header: l.kode ?? 'Kode' },
    { id: 'viewCost', header: l.viewCost ?? 'View Cost' },
    { id: 'name', header: l.jobItem ?? 'Job/Item' },
    { id: 'jenis', header: l.jenis ?? 'Jenis' },
    {
      id: 'volume',
      header: l.volume ?? 'Volume',
      children: [
        { id: 'volumeRab', header: l.rab ?? 'RAB' },
        { id: 'volumeCco', header: l.cco ?? 'CCO' },
        { id: 'volumeActual', header: l.act ?? 'ACT' },
        { id: 'uomName', header: l.uom ?? 'UoM' },
      ],
    },
    ...(isSingle
      ? [{ id: 'amountRab', header: l.amountRab ?? 'RAB' }]
      : [
          {
            id: 'amount',
            header: l.amount ?? 'Amount',
            children: [{ id: 'amountRab', header: l.amountRab ?? 'RAB' }],
          },
        ]),
  ];
}
