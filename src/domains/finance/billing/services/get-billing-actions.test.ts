import { describe, expect, it } from 'vitest';
import type { Billing } from '../types';
import { getBillingActions } from './get-billing-actions';

function makeBilling(overrides: Partial<Billing> = {}): Billing {
  return {
    id: 'billing-1',
    code: 'BILL-001',
    companyId: 'company-1',
    projectId: 'project-1',
    billingType: 'lumsum',
    percentage: 50,
    amount: 100000,
    status: 'draft',
    billedAt: '2026-08-01',
    dueDate: '2026-08-07',
    paidAt: null,
    paidBy: null,
    paymentMethod: null,
    clearedAt: null,
    clearedBy: null,
    checkNumber: null,
    checkIssueDate: null,
    checkEffectiveDate: null,
    notes: null,
    createdBy: 'user-1',
    isActive: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    company: { id: 'company-1', name: 'Curva' },
    project: { id: 'project-1', code: 'PRJ-001', name: 'Project' },
    createdByUser: { id: 'user-1', name: 'Admin' },
    progressItems: [],
    scheduleHistories: [],
    ...overrides,
  };
}

describe('getBillingActions', () => {
  it('shows draft-only actions for draft billing', () => {
    const actions = getBillingActions(makeBilling({ status: 'draft' }));

    expect(actions.canSetAsInvoiced).toBe(true);
    expect(actions.canProgress).toBe(true);
    expect(actions.canDownloadPdf).toBe(true);
    expect(actions.canPay).toBe(false);
    expect(actions.canMarkCleared).toBe(false);
    expect(actions.canCancel).toBe(true);
  });

  it('shows pay and mark cleared for invoiced billing when not cleared yet', () => {
    const actions = getBillingActions(makeBilling({ status: 'invoiced' }));

    expect(actions.canSetAsInvoiced).toBe(false);
    expect(actions.canDownloadPdf).toBe(true);
    expect(actions.canPay).toBe(true);
    expect(actions.canMarkCleared).toBe(true);
    expect(actions.canCancel).toBe(true);
  });

  it('hides mark cleared when clearedByUser already exists', () => {
    const actions = getBillingActions(
      makeBilling({
        status: 'pendingClearance',
        clearedByUser: { id: 'user-2', name: 'Finance' },
      })
    );

    expect(actions.canDownloadPdf).toBe(true);
    expect(actions.canPay).toBe(true);
    expect(actions.canMarkCleared).toBe(false);
    expect(actions.canCancel).toBe(true);
  });

  it('hides mutating payment actions for paid billing', () => {
    const actions = getBillingActions(makeBilling({ status: 'paid', paymentMethod: 'transfer' }));

    expect(actions.canSetAsInvoiced).toBe(false);
    expect(actions.canProgress).toBe(false);
    expect(actions.canDownloadPdf).toBe(true);
    expect(actions.canPay).toBe(false);
    expect(actions.canMarkCleared).toBe(false);
    expect(actions.canCancel).toBe(false);
  });

  it('fails closed for unknown status', () => {
    const actions = getBillingActions(makeBilling({ status: 'weird-status' as never }));

    expect(actions.canViewDetail).toBe(true);
    expect(actions.canProgress).toBe(false);
    expect(actions.canUploadDoc).toBe(false);
    expect(actions.canSchedule).toBe(false);
    expect(actions.canSetAsInvoiced).toBe(false);
    expect(actions.canPay).toBe(false);
    expect(actions.canMarkCleared).toBe(false);
    expect(actions.canCancel).toBe(false);
  });
});
