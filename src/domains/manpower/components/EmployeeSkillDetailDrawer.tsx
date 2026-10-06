'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DetailDrawerTemplate } from '@/shared/components/templates';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useEmployeeSkill } from '../hooks/use-employee-skill';
import { useUpdateEmployeeSkill } from '../hooks/use-update-employee-skill';
import type { EmployeeSkill } from '../types';

interface EmployeeSkillDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  employeeId: string;
  skill: EmployeeSkill | null;
  onSuccess?: () => void;
}

export function EmployeeSkillDetailDrawer({
  open,
  onClose,
  onEdit,
  employeeId,
  skill,
  onSuccess,
}: EmployeeSkillDetailDrawerProps) {
  const { data: skillData, isLoading } = useEmployeeSkill(employeeId, skill?.id ?? '');
  const currentSkill = skillData ?? skill;

  const [localActive, setLocalActive] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);
  const initialValueRef = useRef<boolean | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEmployeeSkill(
    employeeId,
    currentSkill?.id ?? ''
  );

  useEffect(() => {
    if (open && !isLoading && currentSkill != null && initialValueRef.current === null) {
      initialValueRef.current = currentSkill.isActive ?? false;
      setLocalActive(initialValueRef.current);
    }
    if (!open) {
      initialValueRef.current = null;
    }
  }, [open, isLoading, currentSkill]);

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={onEdit}
        title="Detail Skill"
        closeLabel="Tutup"
        editLabel="Edit"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
    updateStatus(
      { skillCatalogId: currentSkill?.skillCatalogId ?? '', isActive: pendingStatus },
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
      title="Detail Skill"
      closeLabel="Tutup"
      editLabel="Edit"
      confirmDialog={
        <ConfirmDialog
          open={isStatusDialogOpen}
          onOpenChange={handleStatusCancel}
          variant="default"
          title="Ubah Status Skill"
          description="Anda akan mengubah status skill ini."
          cancelText="Batal"
          confirmText="Simpan"
          onCancel={handleStatusCancel}
          onConfirm={handleStatusConfirm}
          isLoading={isUpdatingStatus}
        />
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Kode</Label>
        <p className="text-sm font-medium text-slate-950">
          {currentSkill?.skillCatalog?.code ?? '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Skill</Label>
        <p className="text-sm font-medium text-slate-950">
          {currentSkill?.skillCatalog?.name ?? '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Kategori</Label>
        <p className="text-sm font-medium text-slate-950">
          {currentSkill?.skillCatalog?.skillCategory?.name ?? '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">Level</Label>
        <p className="text-sm font-medium text-slate-950">
          {currentSkill?.skillCatalog?.skillLevel?.name ?? '-'}
        </p>
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
