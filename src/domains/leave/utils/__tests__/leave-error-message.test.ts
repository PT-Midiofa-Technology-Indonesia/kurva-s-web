import { describe, expect, it } from 'vitest';
import { ApiErrorClass } from '@/shared/lib/api-error';
import { getFriendlyLeaveErrorToastOptions } from '../leave-error-message';

describe('getFriendlyLeaveErrorToastOptions', () => {
  it('turns technical validation messages into friendly leave text', () => {
    const error = new ApiErrorClass(
      'invalid input: expected string, received null',
      422,
      'VALIDATION_ERROR',
      {
        employeeId: ['invalid input: expected string, received null'],
      }
    );

    expect(getFriendlyLeaveErrorToastOptions(error)).toEqual({
      title: 'Karyawan wajib dipilih.',
    });
  });

  it('combines multiple friendly field errors into a readable toast', () => {
    const error = new ApiErrorClass('Validation failed', 422, 'VALIDATION_ERROR', {
      employeeId: ['invalid input: expected string, received null'],
      startDate: ['invalid input: expected string, received null'],
    });

    const toastOptions = getFriendlyLeaveErrorToastOptions(error);

    expect(toastOptions.title).toBe('Data cuti belum valid');
    expect(toastOptions.description).toContain('Karyawan wajib dipilih.');
    expect(toastOptions.description).toContain('Tanggal mulai wajib diisi.');
  });

  it('keeps friendly API messages intact', () => {
    const error = new ApiErrorClass(
      'Karyawan sudah memiliki cuti di tanggal 2026-07-02.',
      422,
      'VALIDATION_ERROR',
      {
        dates: ['Karyawan sudah memiliki cuti di tanggal 2026-07-02.'],
      }
    );

    expect(getFriendlyLeaveErrorToastOptions(error)).toEqual({
      title: 'Karyawan sudah memiliki cuti di tanggal 2026-07-02.',
    });
  });
});
