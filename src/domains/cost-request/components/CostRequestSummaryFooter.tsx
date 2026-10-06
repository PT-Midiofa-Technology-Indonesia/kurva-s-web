'use client';

import type { ReactNode } from 'react';
import { formatIDR } from '@/shared/utils/currency';
import { COST_REQUEST_LABELS } from '../constants';

interface CostRequestSummaryFooterProps {
  totalAmount: number;
  actions?: ReactNode;
}

export function CostRequestSummaryFooter({ totalAmount, actions }: CostRequestSummaryFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <div>
        <p className="text-sm text-slate-500">{COST_REQUEST_LABELS.CREATE.TOTAL_AMOUNT}:</p>
        <p className="text-lg font-semibold text-slate-950">{formatIDR(totalAmount)}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
