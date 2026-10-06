import { z } from 'zod';
import { requiredEmailSchema } from '@/shared/schemas/email';
import { normalizePhone, requiredPhoneNumberSchema } from '@/shared/schemas/phone';

export const loginFormSchema = z
  .object({
    loginMethod: z.enum(['email', 'phone']),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password wajib diisi.'),
    rememberMe: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.loginMethod === 'email') {
      if (!data.email || !requiredEmailSchema.safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Format email tidak valid',
          path: ['email'],
        });
      }
    } else {
      if (!data.phone || !requiredPhoneNumberSchema.safeParse(data.phone).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Format nomor telepon tidak valid',
          path: ['phone'],
        });
      }
    }
  });

export type LoginFormInput = z.infer<typeof loginFormSchema>;

/**
 * Convert form input to API credentials.
 * Normalizes phone to 62 format (no +), passes email as-is.
 */
export function toLoginCredentials(data: LoginFormInput) {
  const identity =
    data.loginMethod === 'email' ? (data.email ?? '') : normalizePhone(data.phone ?? '');
  return {
    identity,
    password: data.password,
    rememberMe: data.rememberMe,
  };
}
