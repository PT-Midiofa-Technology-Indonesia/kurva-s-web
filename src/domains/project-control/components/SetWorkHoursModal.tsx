'use client';

import { AlertCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { PROJECT_LIST_PAGE_LABELS } from '../constants';
import { useSetWorkHours } from '../hooks/use-set-work-hours';

const DAYS = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
] as const;

interface SetWorkHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workStartTime?: string | null;
  workEndTime?: string | null;
  workDays?: string[];
  readonly?: boolean;
}

export function SetWorkHoursModal({
  open,
  onOpenChange,
  projectId,
  workStartTime: initialStart,
  workEndTime: initialEnd,
  workDays: initialDays,
  readonly = false,
}: SetWorkHoursModalProps) {
  const [startTime, setStartTime] = useState(initialStart ?? '00:00');
  const [endTime, setEndTime] = useState(initialEnd ?? '00:00');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    new Set(initialDays && initialDays.length > 0 ? initialDays : [])
  );
  const mutation = useSetWorkHours();

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleSave = useCallback(() => {
    mutation.mutate(
      {
        projectId,
        payload: {
          workStartTime: startTime,
          workEndTime: endTime,
          workDays: Array.from(selectedDays),
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  }, [projectId, startTime, endTime, selectedDays, mutation, onOpenChange]);

  return (
    <Dialog key={projectId} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {PROJECT_LIST_PAGE_LABELS.WORK_HOURS_MODAL?.TITLE ?? 'Set Jam Kerja'}
          </DialogTitle>
          <DialogDescription>
            {PROJECT_LIST_PAGE_LABELS.WORK_HOURS_MODAL?.DESCRIPTION ??
              'Default mengikuti warehouse.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {readonly && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <span>{PROJECT_LIST_PAGE_LABELS.WORK_HOURS_MODAL.INFO_READONLY}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workStartTime">Jam Mulai</Label>
              <Input
                id="workStartTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={readonly}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workEndTime">Jam Selesai</Label>
              <Input
                id="workEndTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={readonly}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Hari Kerja</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-wrap gap-2 opacity-50 cursor-not-allowed">
                    {DAYS.map((day) => (
                      <label
                        key={day.key}
                        className={`px-3 py-1.5 rounded-md text-sm border pointer-events-none ${
                          selectedDays.has(day.key)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selectedDays.has(day.key)}
                          disabled={true}
                          onChange={() => handleToggleDay(day.key)}
                        />
                        {day.label}
                      </label>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Jadwal diambil dari data warehouse</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Batal
          </Button>
          {!readonly && (
            <Button onClick={handleSave} disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
