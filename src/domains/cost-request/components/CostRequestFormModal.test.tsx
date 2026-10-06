import { describe, expect, it } from 'vitest';
import { getStartOfToday } from './CostRequestFormModal';

describe('CostRequestFormModal due date', () => {
  it('normalizes the minimum due date to the start of today', () => {
    const now = new Date(2026, 7, 31, 15, 45, 30);

    expect(getStartOfToday(now)).toEqual(new Date(2026, 7, 31));
  });
});
