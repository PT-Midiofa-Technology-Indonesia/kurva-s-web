'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from '@/shared/lib/toast';
import { useUpdateBillingSchedule } from '../hooks/use-update-billing-schedule';
import type { Billing } from '../types';

interface ScheduleModalProps {
  open: boolean;
  billing: Billing | null;
  companyId: string;
  onClose: () => void;
}

export function ScheduleModal({ open, billing, companyId, onClose }: ScheduleModalProps) {
  const [billedAt, setBilledAt] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [changeReason, setChangeReason] = useState('');

  const { mutate: updateSchedule, isPending } = useUpdateBillingSchedule();

  useEffect(() => {
    if (billing && open) {
      setBilledAt(billing.billedAt ? billing.billedAt.slice(0, 10) : '');
      setDueDate(billing.dueDate ? billing.dueDate.slice(0, 10) : '');
      setChangeReason('');
    }
  }, [billing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billing) return;
    if (!changeReason.trim()) {
      toast.error({ title: 'Alasan perubahan wajib diisi' });
      return;
    }

    updateSchedule(
      { billingId: billing.id, companyId, billedAt, dueDate, changeReason },
      {
        onSuccess: () => {
          toast.success({ title: 'Jadwal billing berhasil diperbarui' });
          onClose();
        },
        onError: () => {
          toast.error({ title: 'Gagal memperbarui jadwal billing' });
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Set Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal Tagih + Jatuh Tempo - 2 kolom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="billedAt">
                Tanggal Tagih <span className="text-primary">*</span>
              </Label>
              <Input
                id="billedAt"
                type="date"
                value={billedAt}
                onChange={(e) => setBilledAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">
                Jatuh Tempo <span className="text-primary">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Alasan Perubahan - full width textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="changeReason">
              Alasan Perubahan <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="changeReason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Masukkan alasan perubahan jadwal"
              rows={4}
              required
            />
          </div>

          {/* Buttons full width side by side */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="w-full"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
