import { describe, expect, it } from 'vitest';
import { leaveFormSchema } from './index';

describe('leaveFormSchema', () => {
  it('shows friendly messages for null required fields', () => {
    const result = leaveFormSchema.safeParse({
      employeeId: null,
      leaveTypeId: null,
      startDate: '',
      endDate: '',
      description: '',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.flatten().fieldErrors.employeeId).toContain('Karyawan wajib dipilih');
    expect(result.error.flatten().fieldErrors.leaveTypeId).toContain('Jenis cuti wajib dipilih');
  });
});
