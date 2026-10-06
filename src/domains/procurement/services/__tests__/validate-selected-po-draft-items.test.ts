import { describe, expect, it } from 'vitest';
import { validateSelectedPoDraftItems } from '../validate-selected-po-draft-items';

describe('validateSelectedPoDraftItems', () => {
  it('returns selected item ids with missing or non-positive VOL PO', () => {
    const result = validateSelectedPoDraftItems(['item-1', 'item-2', 'item-3'], {
      'item-1': 5,
      'item-2': 0,
    });

    expect(result).toEqual(['item-2', 'item-3']);
  });

  it('returns empty array when all selected items have valid VOL PO', () => {
    const result = validateSelectedPoDraftItems(['item-1', 'item-2'], {
      'item-1': 5,
      'item-2': 2,
    });

    expect(result).toEqual([]);
  });
});
