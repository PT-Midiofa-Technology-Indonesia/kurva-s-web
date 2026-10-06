'use client';

import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DetailDrawerTemplate } from '@/components/templates';
import { Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { Label } from '@/shared/components/ui/label';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import { LEAVE_LABELS, LEAVE_STATUS_BADGE } from '../constants';
import { useCancelLeave } from '../hooks/use-cancel-leave';
import { useLeaveDetail } from '../hooks/use-leave-detail';
import { canEditLeave } from '../utils/leave-permissions';

interface LeaveDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  leaveId: string | null;
  companyId?: string | null;
  onSuccess?: () => void;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-normal text-slate-500">{label}</Label>
      <p className="text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

export function LeaveDetailDrawer({
  open,
  onClose,
  onEdit,
  leaveId,
  companyId,
  onSuccess,
}: LeaveDetailDrawerProps) {
  const { data: leaveResponse, isLoading } = useLeaveDetail(leaveId, companyId);
  const { mutate: cancelLeave, isPending: isCancelling } = useCancelLeave();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const leave = leaveResponse?.success ? leaveResponse.data : null;
  const statusBadge = leave ? LEAVE_STATUS_BADGE[leave.status] : null;

  const customFooter = useMemo(() => {
    if (!leave?.canCancel) return null;

    return (
      <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} className="w-full">
        {LEAVE_LABELS.DETAIL.BUTTONS.CANCEL}
      </Button>
    );
  }, [leave?.canCancel]);

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={undefined}
        title={LEAVE_LABELS.DETAIL.TITLE}
        editLabel={LEAVE_LABELS.DETAIL.BUTTONS.EDIT}
        closeLabel={LEAVE_LABELS.DETAIL.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={leave && canEditLeave(leave.status) ? onEdit : undefined}
      title={LEAVE_LABELS.DETAIL.TITLE}
      editLabel={LEAVE_LABELS.DETAIL.BUTTONS.EDIT}
      closeLabel={LEAVE_LABELS.DETAIL.BUTTONS.CLOSE}
      customFooter={customFooter}
      confirmDialog={
        <ConfirmDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          variant="danger"
          title={LEAVE_LABELS.DIALOG.CANCEL_TITLE}
          description={LEAVE_LABELS.DIALOG.CANCEL_DESCRIPTION}
          cancelText="Batal"
          confirmText="Ya, Batalkan"
          isLoading={isCancelling}
          onCancel={() => setIsCancelDialogOpen(false)}
          onConfirm={() => {
            if (!leave || !companyId) return;

            cancelLeave(
              { id: leave.id, companyId },
              {
                onSuccess: () => {
                  setIsCancelDialogOpen(false);
                  onClose();
                  onSuccess?.();
                },
              }
            );
          }}
        />
      }
    >
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.STATUS}
        value={statusBadge?.label ?? leave?.status ?? '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.LEAVE_TYPE}
        value={leave?.leaveType.name ?? '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.APPLIED_DATE}
        value={leave ? formatDate(leave.appliedDate) : '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.START_DATE}
        value={leave ? formatDate(leave.startDate) : '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.END_DATE}
        value={leave ? formatDate(leave.endDate) : '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.DURATION}
        value={leave ? `${leave.durationDays} hari` : '-'}
      />
      <DetailField
        label={LEAVE_LABELS.DETAIL.FIELDS.DESCRIPTION}
        value={leave?.description || '-'}
      />
      <DetailField label={LEAVE_LABELS.DETAIL.FIELDS.ADMIN_NOTE} value={leave?.adminNote || '-'} />
    </DetailDrawerTemplate>
  );
}
