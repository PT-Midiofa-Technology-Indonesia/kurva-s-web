import type { Billing } from '../types';

export function getBillingActions(billing: Billing) {
  const status = billing.status;
  const isDraft = status === 'draft';
  const isInvoiced = status === 'invoiced';
  const isPendingClearance = status === 'pendingClearance';
  const isPaid = status === 'paid';
  const isCancelled = status === 'cancelled';
  const isKnownStatus = ['draft', 'invoiced', 'pendingClearance', 'paid', 'cancelled'].includes(
    status
  );
  const isCleared = billing.clearedByUser != null;

  return {
    canViewDetail: true,
    canDownloadPdf: isKnownStatus,
    canProgress: isDraft,
    canUploadDoc: isDraft,
    canSchedule: isDraft,
    canSetAsInvoiced: isDraft,
    canPay: isInvoiced || isPendingClearance,
    canMarkCleared: (isInvoiced || isPendingClearance) && !isCleared,
    canCancel: isKnownStatus && !isPaid && !isCancelled,
  };
}
