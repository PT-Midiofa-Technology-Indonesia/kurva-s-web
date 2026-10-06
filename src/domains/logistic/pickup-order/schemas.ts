import { z } from 'zod';

const requiredString = (message: string) =>
  z.preprocess((value) => value ?? '', z.string().min(1, message));

export const pickupOrderFormSchema = z
  .object({
    type: z.enum(['pickup', 'deliver']),
    warehouseId: requiredString('Warehouse wajib dipilih'),
    assignedToEmployeeId: requiredString('PIC wajib dipilih'),
    pickupLocation: requiredString('Pickup location wajib diisi'),
    scheduledDate: requiredString('Tanggal jadwal wajib diisi'),
    deliveryOrderIds: z.array(z.string().min(1)).default([]),
    notes: z.string().optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.deliveryOrderIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimal satu delivery order wajib dipilih',
        path: ['deliveryOrderIds'],
      });
    }

    if (value.scheduledDate) {
      const selectedDate = new Date(`${value.scheduledDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(selectedDate.getTime()) && selectedDate < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tanggal jadwal tidak boleh di masa lalu',
          path: ['scheduledDate'],
        });
      }
    }
  });

export type PickupOrderFormValues = z.infer<typeof pickupOrderFormSchema>;
