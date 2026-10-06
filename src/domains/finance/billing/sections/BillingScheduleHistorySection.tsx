'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { DataTable } from '@/shared/components/organisms/DataTable';
import { formatDate } from '@/shared/utils/format';
import type { BillingScheduleHistory } from '../types';

interface BillingScheduleHistorySectionProps {
  items: BillingScheduleHistory[];
}

export function BillingScheduleHistorySection({ items }: BillingScheduleHistorySectionProps) {
  const columns = useMemo<ColumnDef<BillingScheduleHistory>[]>(
    () => [
      {
        accessorKey: 'billedAt',
        header: 'Tanggal Tagihan',
        enableSorting: false,
        cell: ({ row }) => <span>{formatDate(row.original.billedAt)}</span>,
      },
      {
        accessorKey: 'dueDate',
        header: 'Jatuh Tempo',
        enableSorting: false,
        cell: ({ row }) => <span>{formatDate(row.original.dueDate)}</span>,
      },
      {
        accessorKey: 'changeReason',
        header: 'Alasan Perubahan',
        enableSorting: false,
        cell: ({ row }) => <span>{row.original.changeReason || '-'}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Diubah Pada',
        enableSorting: false,
        cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
      },
    ],
    []
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Riwayat Jadwal</h2>
      </div>
      <DataTable<BillingScheduleHistory, unknown>
        columns={columns}
        data={items}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableRangeSelection={false}
        enableZebraStripes={false}
        stickyHeader
        emptyMessage="Tidak ada riwayat jadwal"
        className="shadow-none rounded-none"
      />
    </div>
  );
}
