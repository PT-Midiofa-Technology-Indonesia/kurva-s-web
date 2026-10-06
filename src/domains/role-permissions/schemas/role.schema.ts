import { z } from 'zod';
import { isActiveSchema } from '@/shared/schemas/is-active';

// Form schema (internal form values)
export const roleFormSchema = z.object({
  name: z.string().min(1, 'Nama role wajib diisi').max(255, 'Nama role maksimal 255 karakter'),
  status: isActiveSchema,
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;
