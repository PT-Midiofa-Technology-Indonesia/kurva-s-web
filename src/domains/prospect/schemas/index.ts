import { z } from 'zod';

export const createProspectSchema = z
  .object({
    title: z.string().min(1, 'Judul prospect wajib diisi'),
    clientName: z.string().min(1, 'Nama client wajib diisi'),
    estimatedValue: z
      .number({ error: 'Estimasi nilai project wajib diisi' })
      .min(1, 'Estimasi nilai harus lebih dari 0'),
    projectStartDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
    projectEndDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
    description: z.string().optional(),
    projectTypeId: z.string().min(1, 'Tipe project wajib diisi'),
    projectCapabilityIds: z.array(z.string()).optional(),
  })
  .refine((v) => v.projectEndDate >= v.projectStartDate, {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['projectEndDate'],
  });

export type CreateProspectFormValues = z.infer<typeof createProspectSchema>;
