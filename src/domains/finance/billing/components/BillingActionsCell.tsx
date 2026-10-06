'use client';

import {
  Check,
  CreditCard,
  EllipsisVertical,
  Eye,
  FileText,
  Settings,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { BILLING_ACTION_LABELS } from '../constants';
import { getBillingActions } from '../services';
import type { Billing } from '../types';

interface BillingActionsCellProps {
  billing: Billing;
  onViewDetail: (id: string) => void;
  onProgress?: (billing: Billing) => void;
  onUploadDoc?: (billing: Billing) => void;
  onSchedule?: (billing: Billing) => void;
  onSetAsInvoiced?: (billing: Billing) => void;
  onPay?: (billing: Billing) => void;
  onMarkCleared?: (billing: Billing) => void;
  onCancel?: (billing: Billing) => void;
}

export function BillingActionsCell({
  billing,
  onViewDetail,
  onProgress,
  onUploadDoc,
  onSchedule,
  onSetAsInvoiced,
  onPay,
  onMarkCleared,
  onCancel,
}: BillingActionsCellProps) {
  const actions = getBillingActions(billing);

  const topGroupCount = [
    actions.canProgress && Boolean(onProgress),
    actions.canUploadDoc && Boolean(onUploadDoc),
    actions.canSchedule && Boolean(onSchedule),
    actions.canSetAsInvoiced && Boolean(onSetAsInvoiced),
  ].filter(Boolean).length;

  const bottomGroupCount = [
    actions.canPay && Boolean(onPay),
    actions.canMarkCleared && Boolean(onMarkCleared),
    actions.canViewDetail,
    actions.canCancel && Boolean(onCancel),
  ].filter(Boolean).length;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-6 w-6 p-0">
            <EllipsisVertical className="h-4 w-4 text-slate-950" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {actions.canProgress && onProgress && (
            <DropdownMenuItem onClick={() => onProgress(billing)}>
              <Settings className="mr-2 h-4 w-4" />
              Progress
            </DropdownMenuItem>
          )}

          {actions.canUploadDoc && onUploadDoc && (
            <DropdownMenuItem onClick={() => onUploadDoc(billing)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Doc
            </DropdownMenuItem>
          )}

          {actions.canSchedule && onSchedule && (
            <DropdownMenuItem onClick={() => onSchedule(billing)}>
              <Settings className="mr-2 h-4 w-4" />
              Schedule
            </DropdownMenuItem>
          )}

          {actions.canSetAsInvoiced && onSetAsInvoiced && (
            <DropdownMenuItem onClick={() => onSetAsInvoiced(billing)}>
              <FileText className="mr-2 h-4 w-4" />
              {BILLING_ACTION_LABELS.SET_AS_INVOICED}
            </DropdownMenuItem>
          )}

          {topGroupCount > 0 && bottomGroupCount > 0 && <DropdownMenuSeparator />}

          {actions.canPay && onPay && (
            <DropdownMenuItem onClick={() => onPay(billing)}>
              <CreditCard className="mr-2 h-4 w-4" />
              {BILLING_ACTION_LABELS.PAY}
            </DropdownMenuItem>
          )}

          {actions.canMarkCleared && onMarkCleared && (
            <DropdownMenuItem onClick={() => onMarkCleared(billing)}>
              <Check className="mr-2 h-4 w-4" />
              {BILLING_ACTION_LABELS.MARK_CLEARED}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => onViewDetail(billing.id)}>
            <Eye className="mr-2 h-4 w-4" />
            {BILLING_ACTION_LABELS.DETAIL}
          </DropdownMenuItem>

          {actions.canCancel && onCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onCancel(billing)}>
                <X className="mr-2 h-4 w-4" />
                {BILLING_ACTION_LABELS.CANCEL}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
