import { z } from 'zod';

export const spkUploadSchema = z.object({
  spkNumber: z.string().min(1, 'Nomor SPK wajib diisi'),
  files: z
    .any()
    .refine((files) => Array.isArray(files) && files.length > 0, 'Minimal 1 file wajib diunggah')
    .refine((files) => Array.isArray(files) && files.length <= 5, 'Maksimal 5 file yang diizinkan'),
});

export type SPKUploadInput = z.infer<typeof spkUploadSchema>;
