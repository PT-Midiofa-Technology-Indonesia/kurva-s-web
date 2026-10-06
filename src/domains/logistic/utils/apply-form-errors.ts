import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiErrorClass } from '@/shared/lib/api-error';

export function applyFormApiErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): boolean {
  if (!(error instanceof ApiErrorClass) || !error.fieldErrors) return false;

  Object.entries(error.fieldErrors).forEach(([field, messages]) => {
    if (!messages || messages.length === 0) return;
    setError(field as Path<TFieldValues>, {
      type: 'server',
      message: messages[0],
    });
  });

  return true;
}
