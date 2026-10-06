import { generateId } from '@/shared/utils/generate-id';
import type { BOQCostRow } from '../types/boq-cost.types';

export function createEmptyRow(): BOQCostRow {
  return { id: generateId(), code: '', name: '' };
}

export function cloneRow<T extends BOQCostRow>(row: T): T {
  return { ...row, id: generateId() };
}

export function appendRow<T extends BOQCostRow>(rows: T[], row: T): T[] {
  return [...rows, row];
}

export function insertRow<T extends BOQCostRow>(
  rows: T[],
  id: string,
  position: 'above' | 'below',
  row: T
): T[] {
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return [...rows, row];
  const at = position === 'below' ? idx + 1 : idx;
  const copy = [...rows];
  copy.splice(at, 0, row);
  return copy;
}

export function updateRow<T extends BOQCostRow>(rows: T[], id: string, patch: Partial<T>): T[] {
  return rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function deleteRow<T extends BOQCostRow>(rows: T[], id: string): T[] {
  return rows.filter((r) => r.id !== id);
}
