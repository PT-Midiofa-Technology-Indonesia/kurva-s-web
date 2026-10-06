'use client';

import { CheckCircle, EllipsisVertical, Eye, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/atoms';
import { Separator } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { PROCUREMENT_LABELS } from '../constants';

interface PoActionsCellProps {
  status: string;
  onDetail?: () => void;
  onIssue?: () => void;
  onCancel?: () => void;
}

export function PoActionsCell({ status, onDetail, onIssue, onCancel }: PoActionsCellProps) {
  const isDraft = status === 'draft';
  const isIssued = status === 'issued';
  const isWaitingApproval = status === 'waiting_approval';

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
          {PROCUREMENT_LABELS.ACTIONS.DETAIL_PO}
        </DropdownMenuItem>

        {isDraft && (
          <>
            <Separator className="flex-1 h-[0.05rem]" />
            <DropdownMenuItem onClick={onIssue}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {PROCUREMENT_LABELS.ACTIONS.ISSUE_PO}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className="text-destructive focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {PROCUREMENT_LABELS.ACTIONS.CANCEL_PO}
            </DropdownMenuItem>
          </>
        )}

        {(isIssued || isWaitingApproval) && (
          <>
            <Separator className="flex-1 h-[0.05rem]" />
            <DropdownMenuItem
              onClick={onCancel}
              className="text-destructive focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {PROCUREMENT_LABELS.ACTIONS.CANCEL_PO}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
