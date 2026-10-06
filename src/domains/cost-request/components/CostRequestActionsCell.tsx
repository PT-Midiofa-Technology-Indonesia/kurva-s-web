'use client';

import { EllipsisVertical, Eye, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/atoms';
import { Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { COST_REQUEST_LABELS } from '../constants';
import type { CostRequestStatus } from '../types';

interface CostRequestActionsCellProps {
  status: CostRequestStatus;
  onDetail?: () => void;
  onCancel?: () => void;
}

export function CostRequestActionsCell({
  status,
  onDetail,
  onCancel,
}: CostRequestActionsCellProps) {
  const canCancel = status === 'submitted';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDetail}>
          <Eye className="mr-2 h-4 w-4" />
          {COST_REQUEST_LABELS.ACTIONS.DETAIL}
        </DropdownMenuItem>

        {canCancel && (
          <>
            <Separator className="flex-1 h-[0.05rem]" />
            <DropdownMenuItem
              onClick={onCancel}
              className="text-destructive focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {COST_REQUEST_LABELS.ACTIONS.CANCEL}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
