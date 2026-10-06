import { z } from 'zod';

export const overtimeSettingsSchema = z
  .object({
    overtimeRatePerHour: z.number().min(1, 'Rate harus lebih dari 0'),
    overtimeRoundingMethod: z.string().min(1, 'Metode pembulatan harus dipilih'),
    overtimeRoundingThresholdMinutes: z.number().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.overtimeRoundingMethod === 'threshold') {
        return (
          data.overtimeRoundingThresholdMinutes !== undefined &&
          data.overtimeRoundingThresholdMinutes !== null &&
          data.overtimeRoundingThresholdMinutes >= 1 &&
          data.overtimeRoundingThresholdMinutes <= 59
        );
      }
      return true;
    },
    {
      message: 'Threshold harus antara 1 dan 59 menit',
      path: ['overtimeRoundingThresholdMinutes'],
    }
  );

export type OvertimeSettingsFormValues = z.infer<typeof overtimeSettingsSchema>;

export const overtimeFormSchema = z
  .object({
    employeeId: z.string().min(1, 'Employee wajib dipilih'),
    overtimeDate: z.string().min(1, 'Tanggal wajib diisi'),
    startTime: z.string().min(1, 'Jam mulai wajib diisi'),
    endTime: z.string().min(1, 'Jam selesai wajib diisi'),
    ratePerHourSnapshot: z.number().min(0),
    totalMinutes: z.number().optional(),
    roundedHours: z.number().optional(),
    amount: z.number().optional(),
    locationType: z.string().min(1, 'Lokasi wajib dipilih'),
    locationId: z.string().optional().default(''),
    status: z.string().min(1, 'Status wajib dipilih'),
    projectId: z.string().optional().default(''),
    notes: z.string().optional().default(''),
    reason: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    { message: 'Jam selesai harus setelah jam mulai', path: ['endTime'] }
  );

export type OvertimeFormValues = z.infer<typeof overtimeFormSchema>;
