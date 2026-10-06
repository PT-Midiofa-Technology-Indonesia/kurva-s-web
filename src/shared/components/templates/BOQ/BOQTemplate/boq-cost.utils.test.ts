import { describe, expect, it } from 'vitest';
import type { BOQCostRow } from '../types/boq-cost.types';
import { resolveNameHeader } from '../types/boq-cost.types';
import {
  appendRow,
  cloneRow,
  createEmptyRow,
  deleteRow,
  insertRow,
  updateRow,
} from './boq-cost.utils';

const row = (id: string, code = id, name = id): BOQCostRow => ({ id, code, name });

describe('resolveNameHeader', () => {
  it('maps known cost types', () => {
    expect(resolveNameHeader('material_cost')).toBe('Nama Material');
    expect(resolveNameHeader('equipment_cost')).toBe('Equipment name');
    expect(resolveNameHeader('man_power_cost')).toBe('Job Title');
  });
  it('prefers an explicit override', () => {
    expect(resolveNameHeader('material_cost', 'Custom')).toBe('Custom');
  });
  it('falls back for unknown types', () => {
    expect(resolveNameHeader('unknown_cost')).toBe('Nama');
  });
});

describe('createEmptyRow', () => {
  it('makes a blank row with a fresh id', () => {
    const r = createEmptyRow();
    expect(r.id).toBeTruthy();
    expect(r.code).toBe('');
    expect(r.name).toBe('');
  });
});

describe('cloneRow', () => {
  it('copies fields with a new id', () => {
    const c = cloneRow(row('a', 'M.1', 'Bata'));
    expect(c.id).not.toBe('a');
    expect(c.code).toBe('M.1');
    expect(c.name).toBe('Bata');
  });
});

describe('appendRow', () => {
  it('adds to the end immutably', () => {
    const rows = [row('a')];
    const next = appendRow(rows, row('b'));
    expect(next.map((r) => r.id)).toEqual(['a', 'b']);
    expect(next).not.toBe(rows);
  });
});

describe('insertRow', () => {
  it('inserts below the target', () => {
    const next = insertRow([row('a'), row('b')], 'a', 'below', row('x'));
    expect(next.map((r) => r.id)).toEqual(['a', 'x', 'b']);
  });
  it('inserts above the target', () => {
    const next = insertRow([row('a'), row('b')], 'b', 'above', row('x'));
    expect(next.map((r) => r.id)).toEqual(['a', 'x', 'b']);
  });
});

describe('updateRow', () => {
  it('patches a row immutably', () => {
    const next = updateRow([row('a')], 'a', { name: 'Pasir' });
    expect(next[0].name).toBe('Pasir');
  });
});

describe('deleteRow', () => {
  it('removes the row', () => {
    const next = deleteRow([row('a'), row('b')], 'a');
    expect(next.map((r) => r.id)).toEqual(['b']);
  });
});

interface ExtendedRow extends BOQCostRow {
  vol?: number;
}

describe('generic row utils', () => {
  it('updateRow preserves extra fields and updates target', () => {
    const rows: ExtendedRow[] = [{ id: 'r1', code: 'C1', name: 'N1', vol: 5 }];
    const result = updateRow(rows, 'r1', { vol: 10 });
    expect(result[0].vol).toBe(10);
    expect(result[0].code).toBe('C1');
  });

  it('cloneRow preserves extra fields and assigns a new id', () => {
    const row: ExtendedRow = { id: 'r1', code: 'C1', name: 'N1', vol: 7 };
    const clone = cloneRow(row);
    expect(clone.vol).toBe(7);
    expect(clone.id).not.toBe('r1');
  });

  it('appendRow preserves the extended type', () => {
    const rows: ExtendedRow[] = [];
    const result = appendRow(rows, { id: 'r1', code: '', name: '', vol: 3 });
    expect(result[0].vol).toBe(3);
  });
});
