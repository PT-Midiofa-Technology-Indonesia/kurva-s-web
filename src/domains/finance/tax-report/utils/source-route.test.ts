import { describe, expect, it } from 'vitest';
import { getTaxReportSourceHref, getTaxReportStatusVariant } from './source-route';

describe('tax report source route helpers', () => {
  it('maps purchase order source to purchase order detail route', () => {
    expect(getTaxReportSourceHref('purchase_order', 'po-1')).toBe(
      '/procurement/purchase-order/po-1'
    );
  });

  it('maps cost request source to cost request detail route', () => {
    expect(getTaxReportSourceHref('cost_request', 'cr-1')).toBe(
      '/expense-management/cost-request/cr-1'
    );
  });

  it('returns null for source without confirmed route', () => {
    expect(getTaxReportSourceHref('billing_client', 'bill-1')).toBeNull();
    expect(getTaxReportSourceHref('payroll', 'pay-1')).toBeNull();
  });

  it('uses destructive variant for reported status to match Figma', () => {
    expect(getTaxReportStatusVariant('reported')).toBe('destructive');
  });
});
