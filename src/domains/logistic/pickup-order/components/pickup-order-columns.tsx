'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Ban, CheckCircle, EllipsisVertical, Eye, UserRound } from 'lucide-react';
import { LOGISTIC_LABELS } from '@/domains/logistic/constants';
import { Badge, Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import { PICKUP_ORDER_STATUS_BADGE, PICKUP_ORDER_TYPE_LABELS } from '../constants';
import type { PickupOrder } from '../types';

const LABELS = LOGISTIC_LABELS.PICKUP_ORDER.COLUMNS;

function formatDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getStatusLabel(status: PickupOrder['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function createPickupOrderColumns({
  onView,
  onChangeEmployee,
  onComplete,
  onCancel,
}: {
  onView?: (item: PickupOrder) => void;
  onChangeEmployee?: (item: PickupOrder) => void;
  onComplete?: (item: PickupOrder) => void;
  onCancel?: (item: PickupOrder) => void;
} = {}): ColumnDef<PickupOrder>[] {
  const columns: ColumnDef<PickupOrder>[] = [
    {
      accessorKey: 'code',
      header: LABELS.CODE,
      size: 180,
    },
    {
      accessorKey: 'type',
      header: LABELS.TYPE,
      size: 120,
      cell: ({ row }) => (
        <span>{PICKUP_ORDER_TYPE_LABELS[row.original.type] ?? row.original.type}</span>
      ),
    },
    {
      id: 'warehouse',
      header: LABELS.WAREHOUSE,
      size: 200,
      cell: ({ row }) => <span>{row.original.warehouse?.name ?? '-'}</span>,
    },
    {
      id: 'employee',
      header: LABELS.PIC,
      size: 180,
      cell: ({ row }) => <span>{row.original.assignedEmployee?.name ?? '-'}</span>,
    },
    {
      accessorKey: 'deliveryOrdersCount',
      header: LABELS.DO,
      size: 80,
      cell: ({ row }) => <span>{row.original.deliveryOrdersCount}</span>,
    },
    {
      accessorKey: 'scheduledDate',
      header: LABELS.SCHEDULED,
      size: 150,
      cell: ({ row }) => <span>{formatDateOnly(row.original.scheduledDate)}</span>,
    },
    {
      accessorKey: 'status',
      header: LABELS.STATUS,
      size: 120,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = PICKUP_ORDER_STATUS_BADGE[status] ?? 'secondary';
        return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: LABELS.CREATED_AT,
      size: 160,
      cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
  ];

  if (onView || onChangeEmployee || onComplete || onCancel) {
    columns.push({
      id: 'actions',
      header: LABELS.ACTIONS,
      enableSorting: false,
      enableHiding: false,
      size: 64,
      cell: ({ row }) => {
        const order = row.original;
        const canChangeEmployee = order.status === 'draft' || order.status === 'assigned';
        const canComplete = order.status === 'assigned';
        const canCancel = order.status === 'draft' || order.status === 'assigned';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Buka aksi">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(order)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat detail
                </DropdownMenuItem>
              )}
              {onChangeEmployee && canChangeEmployee && (
                <DropdownMenuItem onClick={() => onChangeEmployee(order)}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Ubah PIC
                </DropdownMenuItem>
              )}
              {onComplete && canComplete && (
                <DropdownMenuItem onClick={() => onComplete(order)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
              )}
              {onCancel && canCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
}
