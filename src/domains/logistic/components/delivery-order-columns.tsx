'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil } from 'lucide-react';
import { Badge, Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { LOGISTIC_LABELS, SOURCE_TYPE_LABELS, STATUS_BADGE_VARIANT } from '../constants';
import type { DeliveryOrder } from '../types';

const LABELS = LOGISTIC_LABELS.LIST;

export interface DeliveryOrderColumnsOptions {
  showSource?: boolean;
  showDestination?: boolean;
  onView?: (item: DeliveryOrder) => void;
  onEdit?: (item: DeliveryOrder) => void;
}

export function createDeliveryOrderColumns(
  opts: DeliveryOrderColumnsOptions = {}
): ColumnDef<DeliveryOrder>[] {
  const { showSource = true, showDestination = true, onView, onEdit } = opts;

  const columns: ColumnDef<DeliveryOrder>[] = [
    {
      accessorKey: 'code',
      header: LABELS.COLUMNS.CODE,
      size: 220,
    },
    {
      accessorKey: 'sourceType',
      header: LABELS.COLUMNS.TYPE,
      size: 180,
      cell: ({ row }) => (
        <span>{SOURCE_TYPE_LABELS[row.original.sourceType] ?? row.original.sourceType}</span>
      ),
    },
  ];

  if (showSource) {
    columns.push({
      id: 'source',
      header: LABELS.COLUMNS.SOURCE,
      size: 200,
      cell: ({ row }) => <span>{row.original.sourceWarehouse?.name ?? '-'}</span>,
    });
  }

  if (showDestination) {
    columns.push({
      id: 'destination',
      header: LABELS.COLUMNS.DESTINATION,
      size: 200,
      cell: ({ row }) => <span>{row.original.destinationWarehouse?.name ?? '-'}</span>,
    });
  }

  columns.push(
    {
      accessorKey: 'etd',
      header: LABELS.COLUMNS.ETD,
      size: 140,
      cell: ({ row }) => {
        const date = new Date(row.original.etd);
        return (
          <span>
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'eta',
      header: LABELS.COLUMNS.ETA,
      size: 140,
      cell: ({ row }) => {
        const date = new Date(row.original.eta);
        return (
          <span>
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: LABELS.COLUMNS.STATUS,
      size: 120,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = STATUS_BADGE_VARIANT[status] ?? 'default';
        const label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        return <Badge variant={variant}>{label}</Badge>;
      },
    }
  );

  if (onView || onEdit) {
    columns.push({
      id: 'actions',
      header: LABELS.ACTIONS,
      enableSorting: false,
      enableHiding: false,
      size: 60,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                {LABELS.ACTION_VIEW}
              </DropdownMenuItem>
            )}
            {onEdit && row.original.status !== 'received' && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" />
                {LABELS.ACTION_EDIT}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
}
