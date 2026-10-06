'use client';

import { EllipsisVertical, Eye, Trash2 } from 'lucide-react';
import { forwardRef } from 'react';
import { Button } from '@/shared/components/atoms';
import { Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { PROCUREMENT_LABELS } from '../constants';

interface PurchaseRequestActionsCellProps {
  onView?: () => void;
  onDeleteClick?: () => void;
}

export const PurchaseRequestActionsCell = forwardRef<
  HTMLButtonElement,
  PurchaseRequestActionsCellProps
>(function PurchaseRequestActionsCell({ onView, onDeleteClick }, _ref) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          {PROCUREMENT_LABELS.ACTIONS.VIEW_PR}
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem
          onClick={onDeleteClick}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {PROCUREMENT_LABELS.ACTIONS.HAPUS_PR}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
