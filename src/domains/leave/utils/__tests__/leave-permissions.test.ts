import { describe, expect, it } from 'vitest';
import { canEditLeave } from '../leave-permissions';

describe('canEditLeave', () => {
  it('disallows editing approved leave', () => {
    expect(canEditLeave('approved')).toBe(false);
  });

  it('disallows editing cancelled leave', () => {
    expect(canEditLeave('cancelled')).toBe(false);
  });

  it('allows editing pending leave', () => {
    expect(canEditLeave('pending_approval')).toBe(true);
  });
});
