'use client';

import { Ban, EllipsisVertical, Eye } from 'lucide-react';
import { Button } from '@/shared/components/atoms';
import { Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { PROCUREMENT_LABELS } from '../constants';

interface PoDraftActionsCellProps {
  status: string;
  onView?: () => void;
  onCancelClick?: () => void;
}

export function PoDraftActionsCell({ status, onView, onCancelClick }: PoDraftActionsCellProps) {
  const showView = status === 'finalized' || status === 'draft';
  const showCancel = status === 'draft';

  if (status === 'cancelled') return null;
  if (!showView && !showCancel) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            {PROCUREMENT_LABELS.ACTIONS.VIEW_DRAFT}
          </DropdownMenuItem>
        )}
        {showView && showCancel && <Separator className="flex-1 h-[0.05rem]" />}
        {showCancel && (
          <DropdownMenuItem
            onClick={onCancelClick}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            {PROCUREMENT_LABELS.ACTIONS.CANCEL_DRAFT}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
