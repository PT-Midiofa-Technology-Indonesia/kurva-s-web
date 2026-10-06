import { z } from 'zod';

const PHONE_ERROR_MESSAGE = 'Nomor telepon tidak valid (contoh: 6281234567890)';

const PHONE_REGEX = /^62\d{6,15}$/;

export function normalizePhone(val: string): string {
  if (!val) return val;
  const digits = val.replace(/\D/g, '');
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

/**
 * Optional phone number schema — validates 62 format if provided.
 * Allows empty string and undefined.
 * Transforms input to normalize 62 prefix (no +).
 */
export const optionalPhoneNumberSchema = z
  .string()
  .transform(normalizePhone)
  .refine((val) => val === '' || PHONE_REGEX.test(val), {
    message: PHONE_ERROR_MESSAGE,
  });

/**
 * Required phone number schema — validates 62 format, must not be empty.
 * Transforms input to normalize 62 prefix (no +).
 */
export const requiredPhoneNumberSchema = z
  .string()
  .min(1, 'Nomor telepon wajib diisi')
  .transform(normalizePhone)
  .refine((val) => PHONE_REGEX.test(val), {
    message: PHONE_ERROR_MESSAGE,
  });
