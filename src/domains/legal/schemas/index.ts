import { z } from 'zod';
import { nameRequiredSchema, optionalStringSchema } from '@/shared/schemas/common';
import { requiredEmailSchema } from '@/shared/schemas/email';
import { requiredPhoneNumberSchema } from '@/shared/schemas/phone';

export const deleteAccountRequestSchema = z.object({
  fullName: nameRequiredSchema,
  email: requiredEmailSchema,
  phone: requiredPhoneNumberSchema,
  reason: optionalStringSchema,
  confirmation: z.literal(true, {
    message: 'Anda harus menyetujui pernyataan ini untuk melanjutkan',
  }),
});

export type DeleteAccountRequestInput = z.infer<typeof deleteAccountRequestSchema>;
