'use client';

import { Ban, Loader2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Badge } from '@/shared/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Separator } from '@/shared/components/ui/separator';
import { formatIDR } from '@/shared/utils/currency';
import { formatDateLong } from '@/shared/utils/format';
import { OVERTIME_LABELS } from '../constants';
import { useCancelOvertime } from '../hooks/use-cancel-overtime';
import { useOvertimeDetail } from '../hooks/use-overtime-detail';

interface OvertimeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  overtimeId: string | null;
  companyId: string | null;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-950">{children}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="secondary">{status === 'done' ? 'Done' : 'Cancelled'}</Badge>;
}

export function OvertimeDetailDrawer({
  open,
  onClose,
  overtimeId,
  companyId,
}: OvertimeDetailDrawerProps) {
  const { data: detail, isLoading } = useOvertimeDetail(overtimeId, companyId);
  const { mutate: cancelOvertimeAction } = useCancelOvertime();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleCancelConfirm = useCallback(() => {
    if (!overtimeId || !companyId) return;
    cancelOvertimeAction(
      { id: overtimeId, companyId },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          onClose();
        },
      }
    );
  }, [overtimeId, companyId, cancelOvertimeAction, onClose]);

  return (
    <>
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
        <DrawerContent className="inset-y-0! right-0! left-auto! mt-0! w-lg max-w-lg rounded-l-xl! rounded-r-none! border-l! flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
                Detail Overtime
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : !detail ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-slate-500">Data tidak ditemukan</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              {/* Attendance ID */}
              <div>
                <span className="text-xs text-slate-500">Attendance ID</span>
                <p className="text-sm font-medium text-slate-950">
                  #{detail.attendanceId ?? detail.id.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <Separator />

              {/* Status + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">Date</span>
                  <span className="text-sm font-medium text-slate-950">
                    {formatDateLong(detail.overtimeDate)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Nama + Company */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Nama">{detail.employee.fullName}</DetailRow>
                <DetailRow label="Company ID">{detail.company.name}</DetailRow>
              </div>

              <Separator />

              {/* Location + Location ID */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Location">{detail.locationType}</DetailRow>
                <DetailRow label="Location ID">{detail.locationId ?? '-'}</DetailRow>
              </div>

              <Separator />

              {/* Project + Status */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Project">{detail.project?.name ?? '-'}</DetailRow>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={detail.status} />
                </div>
              </div>

              <Separator />

              {/* Start Time + End Time */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Start time">{detail.startTime}</DetailRow>
                <DetailRow label="End Time">{detail.endTime}</DetailRow>
              </div>

              <Separator />

              {/* Rate Per Hour + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Rate Per Hour">{formatIDR(detail.ratePerHourSnapshot)}</DetailRow>
                <DetailRow label="Duration">{detail.totalMinutes} minutes</DetailRow>
              </div>

              <Separator />

              {/* Amount — right-aligned */}
              <div className="flex justify-end">
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-xs text-slate-500">Amount</span>
                  <p className="text-base font-bold text-slate-950">{formatIDR(detail.amount)}</p>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              {detail.notes && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">Notes</span>
                  <p className="text-sm text-slate-950 leading-relaxed">{detail.notes}</p>
                </div>
              )}

              {/* Reason */}
              {detail.reason && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">Reason</span>
                  <p className="text-sm text-slate-950 leading-relaxed">{detail.reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer dengan action buttons */}
          {!isLoading && detail && (
            <div className="border-t px-6 py-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                leftIcon={<Ban className="h-4 w-4" />}
                className="flex-1"
              >
                {OVERTIME_LABELS.ACTIONS.CANCEL}
              </Button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        variant="danger"
        title={OVERTIME_LABELS.DIALOG.CANCEL_TITLE}
        description={OVERTIME_LABELS.DIALOG.CANCEL_DESCRIPTION}
        cancelText="Batal"
        confirmText="Ya, Batalkan"
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
