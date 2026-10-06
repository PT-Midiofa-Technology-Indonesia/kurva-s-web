'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface BulkInputModalProps {
  open: boolean;
  onClose: () => void;
  companyId?: string | null;
}

export function BulkInputModal({ open, onClose, companyId }: BulkInputModalProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleSubmit = useCallback(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const params = new URLSearchParams({ date: dateStr });
    if (companyId) params.set('companyId', companyId);
    router.push(`/human-resource/attendance/bulk?${params.toString()}`);
  }, [selectedDate, companyId, router]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Input Attendance</DialogTitle>
          <DialogDescription>
            Pilih tanggal untuk melakukan pengisian kehadiran massal. Sistem akan memuat daftar
            karyawan aktif pada tanggal tersebut.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="text-sm font-medium text-slate-900">Tanggal Kehadiran</div>
          <DatePicker
            mode="single"
            value={selectedDate}
            onChange={(v) => setSelectedDate(v as Date | undefined)}
            placeholder="Pilih tanggal"
          />
        </div>

        <DialogFooter className="gap-2 bg-white">
          <DialogClose asChild className="flex-1">
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button disabled={!selectedDate} onClick={handleSubmit} className="flex-1">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
