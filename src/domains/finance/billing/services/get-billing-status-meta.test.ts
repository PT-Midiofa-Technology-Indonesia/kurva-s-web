import { describe, expect, it } from 'vitest';
import { getBillingStatusMeta } from './get-billing-status-meta';

describe('getBillingStatusMeta', () => {
  it('maps pending clearance status to explicit label and secondary badge', () => {
    const meta = getBillingStatusMeta('pendingClearance');

    expect(meta.label).toBe('Menunggu Clearance');
    expect(meta.badgeVariant).toBe('secondary');
    expect(meta.calendarColor).toBe('orange');
  });

  it('maps paid status to success badge', () => {
    const meta = getBillingStatusMeta('paid');

    expect(meta.label).toBe('Dibayar');
    expect(meta.badgeVariant).toBe('success');
    expect(meta.calendarColor).toBe('green');
  });

  it('falls back for unknown status', () => {
    const meta = getBillingStatusMeta('unknown-status');

    expect(meta.label).toBe('Status Tidak Dikenal');
    expect(meta.badgeVariant).toBe('secondary');
    expect(meta.calendarColor).toBe('slate');
  });
});
