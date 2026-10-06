'use client';

import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { useChangePickupOrderEmployee, usePickupOrderAvailableEmployeesQuery } from '../hooks';
import type { PickupOrder } from '../types';

interface PickupOrderChangeEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  order: PickupOrder | null;
  companyId: string | null;
}

export function PickupOrderChangeEmployeeDialog({
  open,
  onClose,
  onSuccess,
  order,
  companyId,
}: PickupOrderChangeEmployeeDialogProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const { mutateAsync: changeEmployee, isPending } = useChangePickupOrderEmployee();
  const { data: employees = [], isLoading } = usePickupOrderAvailableEmployeesQuery(
    order?.warehouse?.id ?? '',
    { companyId: companyId ?? undefined, search: employeeSearch },
    open && !!order?.warehouse?.id
  );

  const employeeOptions = useMemo(
    () => employees.map((employee) => ({ value: employee.id, label: employee.name })),
    [employees]
  );

  useEffect(() => {
    if (open) {
      setEmployeeId(order?.assignedEmployee?.id ?? '');
      setEmployeeSearch('');
    }
  }, [open, order]);

  const handleSubmit = async () => {
    if (!order || !companyId || !employeeId) return;

    try {
      await changeEmployee({
        id: order.id,
        payload: { assignedToEmployeeId: employeeId },
        companyId,
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error({ title: getErrorMessage(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah PIC Pickup Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label className="text-sm font-medium text-slate-700">PIC</Label>
          <AsyncSelect
            options={employeeOptions}
            value={employeeId}
            onChange={(selected) => {
              const value = Array.isArray(selected) ? selected[0] : selected;
              setEmployeeId(value || '');
            }}
            isSearchable
            onSearchChange={setEmployeeSearch}
            isLoading={isLoading}
            placeholder="Pilih PIC"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!employeeId || isPending}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
