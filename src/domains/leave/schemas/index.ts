import { z } from 'zod';

const requiredString = (message: string) =>
  z.preprocess((value) => value ?? '', z.string().min(1, message));

export const leaveSaveSchema = z.object({
  employeeId: requiredString('Karyawan wajib dipilih'),
  leaveTypeId: requiredString('Jenis cuti wajib dipilih'),
  startDate: requiredString('Tanggal mulai wajib diisi'),
  endDate: requiredString('Tanggal berakhir wajib diisi'),
  description: z.string().optional().default(''),
});

export const leaveFormSchema = leaveSaveSchema.refine((data) => data.endDate >= data.startDate, {
  message: 'Tanggal berakhir harus sama atau setelah tanggal mulai',
  path: ['endDate'],
});

export type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export const leaveSettingsSchema = z.object({
  leaveTypes: z.array(
    z.object({
      id: z.string(),
      leaveType: z.string().min(1, 'Jenis cuti wajib diisi'),
      annualQuota: z.number().min(0, 'Kuota tidak boleh negatif'),
      requiresApproval: z.boolean(),
      isActive: z.boolean(),
    })
  ),
});

export type LeaveSettingsFormValues = z.infer<typeof leaveSettingsSchema>;
