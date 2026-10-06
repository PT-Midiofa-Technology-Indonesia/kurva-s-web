import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { PAYMENT_REQUEST_LABELS } from '../constants';
import { useUpdateDueDate } from '../hooks/use-update-due-date';

const labels = PAYMENT_REQUEST_LABELS.EDIT_DUE_DATE;

const formSchema = z.object({
  dueDate: z.string().min(1, labels.DATE_REQUIRED),
  time: z.string().min(1, labels.TIME_REQUIRED),
});

type FormValues = z.infer<typeof formSchema>;

export interface EditDueDateModalProps {
  open: boolean;
  onClose: () => void;
  paymentRequestId: string;
  initialDate?: string | null;
}

export function EditDueDateModal({
  open,
  onClose,
  paymentRequestId,
  initialDate,
}: EditDueDateModalProps) {
  const { mutateAsync, isPending } = useUpdateDueDate(paymentRequestId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: '',
      time: '',
    },
  });

  useEffect(() => {
    if (open && initialDate) {
      const dateObj = new Date(initialDate);
      if (!Number.isNaN(dateObj.getTime())) {
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj
          .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          .replace('.', ':');
        reset({ dueDate: dateStr, time: timeStr });
      } else {
        reset({ dueDate: initialDate, time: '00:00' });
      }
    } else if (open && !initialDate) {
      reset({ dueDate: '', time: '' });
    }
  }, [open, initialDate, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync({
        date: values.dueDate,
        time: values.time,
      });
      toast.success({ title: 'Due Date berhasil diubah' });
      onClose();
    } catch (error: any) {
      toast.error({ title: 'Gagal mengubah due date', description: error.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.TITLE}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">{labels.DATE}</label>
            <div className="relative mt-1">
              <Input
                type="date"
                {...register('dueDate')}
                className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <Calendar className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">{labels.TIME}</label>
            <div className="relative mt-1">
              <Input
                type="time"
                {...register('time')}
                className="pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <Clock className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
            {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isPending}>
              {isPending ? labels.SAVING : labels.SAVE}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
