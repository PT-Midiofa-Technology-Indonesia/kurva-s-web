import { describe, expect, it } from 'vitest';
import { getLeaveConflictMessage, getLeaveQuotaExceededMessage } from '../leave-quota';

describe('getLeaveQuotaExceededMessage', () => {
  it('returns no message when the requested duration fits within quota', () => {
    expect(getLeaveQuotaExceededMessage({ durationDays: 3, quotaRemaining: 3 })).toBeNull();
  });

  it('returns a message when the requested duration exceeds the quota', () => {
    expect(getLeaveQuotaExceededMessage({ durationDays: 4, quotaRemaining: 3 })).toBe(
      'Pengajuan melebihi sisa kuota cuti 3 hari.'
    );
  });

  it('allows unlimited quota when quota is not defined', () => {
    expect(getLeaveQuotaExceededMessage({ durationDays: 10, quotaRemaining: null })).toBeNull();
  });
});

describe('getLeaveConflictMessage', () => {
  it('returns no message when dates do not overlap existing leaves', () => {
    expect(
      getLeaveConflictMessage({
        existingLeaves: [{ startDate: '2026-07-01', endDate: '2026-07-02', status: 'approved' }],
        startDate: '2026-07-03',
        endDate: '2026-07-04',
      })
    ).toBeNull();
  });

  it('returns a message when dates overlap an existing leave', () => {
    expect(
      getLeaveConflictMessage({
        existingLeaves: [{ startDate: '2026-07-01', endDate: '2026-07-02', status: 'approved' }],
        startDate: '2026-07-02',
        endDate: '2026-07-05',
      })
    ).toBe('Karyawan sudah memiliki cuti di tanggal 2026-07-02.');
  });

  it('ignores the leave being edited when excludeLeaveId matches', () => {
    expect(
      getLeaveConflictMessage({
        existingLeaves: [
          {
            id: 'leave-1',
            startDate: '2026-07-01',
            endDate: '2026-07-02',
            status: 'approved',
          },
        ],
        startDate: '2026-07-01',
        endDate: '2026-07-02',
        excludeLeaveId: 'leave-1',
      })
    ).toBeNull();
  });
});
