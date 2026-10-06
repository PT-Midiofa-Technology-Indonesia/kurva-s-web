'use client';

import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DetailDrawerTemplate } from '@/shared/components/templates';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useEmployeeWorkplace } from '../hooks/use-employee-workplace';
import { useUpdateEmployeeWorkplace } from '../hooks/use-update-employee-workplace';
import type { EmployeeWorkplace } from '../types';

interface EmployeeWorkplaceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  employeeId: string;
  workplace: EmployeeWorkplace | null;
  onSuccess?: () => void;
}

const WORKPLACE_TYPE_LABEL: Record<string, string> = {
  office: 'Office',
  warehouse: 'Warehouse',
};

export function EmployeeWorkplaceDetailDrawer({
  open,
  onClose,
  onEdit,
  employeeId,
  workplace,
  onSuccess,
}: EmployeeWorkplaceDetailDrawerProps) {
  const { data: workplaceData, isLoading } = useEmployeeWorkplace(employeeId, workplace?.id ?? '');
  const current = workplaceData ?? workplace;

  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEmployeeWorkplace(
    employeeId,
    current?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && current != null && initialValueRef.current === null) {
      initialValueRef.current = current.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, current]);

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={onEdit}
        title="Detail Work Place"
        closeLabel="Tutup"
        editLabel="Edit"
      >
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  const handleStatusToggle = (checked: boolean) => {
    setPendingStatus(checked);
    setIsStatusDialogOpen(true);
  };

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false);
  };

  const handleStatusConfirm = () => {
    if (!current) return;
    updateStatus(
      {
        workplaceType: current.workplaceType,
        workplaceId: current.workplaceId,
        assignedAt: current.assignedAt,
        notes: current.notes,
        isActive: pendingStatus,
      },
      {
        onSuccess: () => {
          setLocalActive(pendingStatus);
          setIsStatusDialogOpen(false);
          onSuccess?.();
        },
        onError: () => {
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={onEdit}
      title="Detail Work Place"
      closeLabel="Tutup"
      editLabel="Edit"
      confirmDialog={
        <ConfirmDialog
          open={isStatusDialogOpen}
          onOpenChange={handleStatusCancel}
          variant="default"
          title="Ubah Status Work Place"
          description="Anda akan mengubah status work place ini."
          cancelText="Batal"
          confirmText="Simpan"
          onCancel={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          isLoading={isUpdatingStatus}
        />
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Tipe</Label>
        <p className="text-sm font-medium text-slate-950">
          {WORKPLACE_TYPE_LABEL[current?.workplaceType ?? ''] ?? current?.workplaceType ?? '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Kode</Label>
        <p className="text-sm font-medium text-slate-950">{current?.workplace?.code ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Nama</Label>
        <p className="text-sm font-medium text-slate-950">{current?.workplace?.name ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Tanggal Assign</Label>
        <p className="text-sm font-medium text-slate-950">
          {current?.assignedAt ? format(new Date(current.assignedAt), 'dd/MM/yyyy') : '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Catatan</Label>
        <p className="text-sm font-medium text-slate-950">{current?.notes ?? '-'}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Status</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={localActive}
            onCheckedChange={handleStatusToggle}
            className="data-[state=checked]:bg-brand-600"
          />
          <span className="text-sm font-medium text-slate-950">
            {localActive ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
