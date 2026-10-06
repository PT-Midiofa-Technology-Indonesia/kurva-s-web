import { generateId } from '@/shared/utils/generate-id';
import type { BOQCostRow, BOQCostSection } from '../types/boq-cost.types';
import type { BOQUomAsyncSelect } from '../types/boq-planning.types';

export interface BOQPlanningCostRow extends BOQCostRow {
  vol?: number;
  satuan?: string;
  /** Equipment Cost & Manpower Cost only */
  durasiSewa?: number;
  durationUoM?: string;
  hargaSatuan?: number;
  keterangan?: string;
  // jumlahHarga is computed: (vol ?? 0) * (hargaSatuan ?? 0) — never stored

  /** Project-level RAB fields */
  volumeRab?: number;
  uomId?: string;
  uomLabel?: string;
  durationRab?: number;
  durationUomId?: string;
  durationUomLabel?: string;
  unitPriceRab?: number;
  catalogId?: string;
}

export interface BOQPlanningCostSection extends Omit<BOQCostSection, 'rows'> {
  rows: BOQPlanningCostRow[];
  /** UOM async-select config for the satuan (Volume UoM) column — general list, no groupType filter */
  uomAsyncSelect?: BOQUomAsyncSelect;
  /** UOM async-select config for the durationUoM column — typically groupType=time filtered */
  durationUomAsyncSelect?: BOQUomAsyncSelect;
}

export interface CostSectionError {
  /** Global table-level errors (e.g. 'Minimal satu dari items atau deletedIds harus diisi') */
  tableErrors: string[];
  /** Per-row errors keyed by row index: { 0: ['catalogId wajib diisi'] } */
  rowErrors: Record<number, string[]>;
}

export function createEmptyPlanningCostRow(): BOQPlanningCostRow {
  return { id: generateId(), code: '', name: '' };
}
