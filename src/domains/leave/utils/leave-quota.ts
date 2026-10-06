import { differenceInCalendarDays, parseISO } from 'date-fns';

export function getLeaveDurationDays(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 0;

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(0, differenceInCalendarDays(end, start) + 1);
}

export function getLeaveQuotaExceededMessage({
  durationDays,
  quotaRemaining,
}: {
  durationDays: number;
  quotaRemaining: number | null | undefined;
}) {
  if (quotaRemaining == null) return null;
  if (durationDays <= 0) return null;
  if (durationDays <= quotaRemaining) return null;

  return `Pengajuan melebihi sisa kuota cuti ${quotaRemaining} hari.`;
}

function isOverlappingRange(startA: string, endA: string, startB: string, endB: string) {
  return startA <= endB && startB <= endA;
}

export function getLeaveConflictMessage({
  existingLeaves,
  startDate,
  endDate,
  excludeLeaveId,
}: {
  existingLeaves: Array<{
    id?: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  startDate?: string | null;
  endDate?: string | null;
  excludeLeaveId?: string | null;
}) {
  if (!startDate || !endDate) return null;
  if (startDate > endDate) return null;

  const conflict = existingLeaves.find(
    (item) =>
      item.status !== 'cancelled' &&
      (excludeLeaveId == null || item.id !== excludeLeaveId) &&
      isOverlappingRange(item.startDate, item.endDate, startDate, endDate)
  );

  if (!conflict) return null;

  const conflictDate = conflict.startDate > startDate ? conflict.startDate : startDate;

  return `Karyawan sudah memiliki cuti di tanggal ${conflictDate}.`;
}
