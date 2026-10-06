import { getErrorCode, getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import type { ToastOptions } from '@/shared/lib/toast';
import { LEAVE_LABELS } from '../constants';

const TECHNICAL_VALIDATION_PATTERNS = [
  /invalid input/i,
  /expected .* received null/i,
  /expected .* received undefined/i,
  /expected string/i,
  /must be string/i,
  /cannot be null/i,
];

const FIELD_FRIENDLY_MESSAGES: Record<string, string> = {
  employeeId: 'Karyawan wajib dipilih.',
  leaveTypeId: 'Jenis cuti wajib dipilih.',
  startDate: 'Tanggal mulai wajib diisi.',
  endDate: 'Tanggal berakhir wajib diisi.',
  description: 'Keterangan tidak valid.',
  reason: 'Keterangan tidak valid.',
  dates: 'Tanggal cuti tidak valid.',
};

function isTechnicalValidationMessage(message: string) {
  return TECHNICAL_VALIDATION_PATTERNS.some((pattern) => pattern.test(message));
}

function formatFieldError(field: string, message: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) return null;
  if (!isTechnicalValidationMessage(trimmedMessage)) return trimmedMessage;

  return FIELD_FRIENDLY_MESSAGES[field] ?? 'Data cuti belum valid.';
}

export function getFriendlyLeaveErrorToastOptions(error: unknown): ToastOptions {
  const message = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  const fieldErrors = getFieldErrors(error);

  const friendlyFieldMessages = fieldErrors
    ? Object.entries(fieldErrors)
        .flatMap(([field, messages]) =>
          messages
            .map((item) => formatFieldError(field, item))
            .filter((item): item is string => !!item)
        )
        .filter((item, index, array) => array.indexOf(item) === index)
    : [];

  if (friendlyFieldMessages.length === 1) {
    return { title: friendlyFieldMessages[0] };
  }

  if (friendlyFieldMessages.length > 1) {
    return {
      title: 'Data cuti belum valid',
      description: friendlyFieldMessages.join(' '),
    };
  }

  if (errorCode === 'VALIDATION_ERROR' || isTechnicalValidationMessage(message)) {
    return {
      title: 'Data cuti belum valid',
      description:
        'Periksa kembali isian yang wajib diisi. Pastikan format tanggal dan pilihan karyawan sudah benar.',
    };
  }

  return { title: message || LEAVE_LABELS.LIST.TITLE };
}
