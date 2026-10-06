'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Ban, CheckCircle, Edit, EllipsisVertical, Eye, Loader, Trash2 } from 'lucide-react';
import { LOGISTIC_LABELS } from '@/domains/logistic/constants';
import { Badge, Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import { LOADING_ORDER_SOURCE_TYPE_LABELS, LOADING_ORDER_STATUS_BADGE } from '../constants';
import type { LoadingOrder } from '../types';

const LABELS = LOGISTIC_LABELS.LOADING_ORDER.COLUMNS;

function getSourceLabel(order: LoadingOrder) {
  if (order.sourceType === 'allocation') {
    return order.resourceAllocation?.code ?? '-';
  }

  return order.sourceWarehouse?.name ?? '-';
}

function getStatusLabel(status: LoadingOrder['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function createLoadingOrderColumns({
  onView,
  onEdit,
  onPrepare,
  onLoad,
  onCancel,
  onDelete,
}: {
  onView?: (item: LoadingOrder) => void;
  onEdit?: (item: LoadingOrder) => void;
  onPrepare?: (item: LoadingOrder) => void;
  onLoad?: (item: LoadingOrder) => void;
  onCancel?: (item: LoadingOrder) => void;
  onDelete?: (item: LoadingOrder) => void;
} = {}): ColumnDef<LoadingOrder>[] {
  const columns: ColumnDef<LoadingOrder>[] = [
    {
      accessorKey: 'code',
      header: LABELS.CODE,
      size: 180,
    },
    {
      id: 'sourceType',
      header: LABELS.SOURCE_TYPE,
      size: 140,
      cell: ({ row }) => (
        <span>
          {LOADING_ORDER_SOURCE_TYPE_LABELS[row.original.sourceType] ?? row.original.sourceType}
        </span>
      ),
    },
    {
      id: 'source',
      header: LABELS.SOURCE,
      size: 200,
      cell: ({ row }) => <span>{getSourceLabel(row.original)}</span>,
    },
    {
      id: 'destination',
      header: LABELS.DESTINATION,
      size: 200,
      cell: ({ row }) => <span>{row.original.destinationWarehouse?.name ?? '-'}</span>,
    },
    {
      accessorKey: 'itemsCount',
      header: LABELS.ITEMS,
      size: 100,
      cell: ({ row }) => <span>{row.original.itemsCount}</span>,
    },
    {
      accessorKey: 'status',
      header: LABELS.STATUS,
      size: 120,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = LOADING_ORDER_STATUS_BADGE[status] ?? 'secondary';
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

  if (onView || onEdit || onPrepare || onLoad || onCancel || onDelete) {
    columns.push({
      id: 'actions',
      header: LABELS.ACTIONS,
      enableSorting: false,
      enableHiding: false,
      size: 64,
      cell: ({ row }) => {
        const order = row.original;
        const isDraft = order.status === 'draft';
        const isPrepared = order.status === 'prepared';

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
              {onEdit && isDraft && (
                <DropdownMenuItem onClick={() => onEdit(order)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onPrepare && isDraft && (
                <DropdownMenuItem onClick={() => onPrepare(order)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Prepare
                </DropdownMenuItem>
              )}
              {onLoad && isPrepared && (
                <DropdownMenuItem onClick={() => onLoad(order)}>
                  <Loader className="mr-2 h-4 w-4" />
                  Load
                </DropdownMenuItem>
              )}
              {onCancel && (isDraft || isPrepared) && (
                <DropdownMenuItem onClick={() => onCancel(order)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}
              {onDelete && isDraft && (
                <DropdownMenuItem
                  onClick={() => onDelete(order)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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
