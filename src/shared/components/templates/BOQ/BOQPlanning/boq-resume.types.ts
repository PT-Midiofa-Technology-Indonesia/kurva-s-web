import { generateId } from '@/shared/utils/generate-id';
import type { BOQCostRow } from '../types/boq-cost.types';

/** Resume Material & Transportation Cost — one input row. Derived columns never stored. */
export interface BOQResumeMaterialRow extends BOQCostRow {
  vol?: number;
  volCco?: number;
  volAct?: number;
  satuan?: string;
  materialOriginal?: number;
  materialMarkup?: number; // percent: 25 = 25% (editable in Planning)
  /** Base unit price from API — never changes, used in computeUnitPrice formula. */
  materialBaseUnitPrice?: number;
  /** Override — use BE's unitPriceRab directly instead of computed value. */
  materialUnitPriceOverride?: number;
  /** Override — use BE's totalCostMaterial directly. */
  totalMaterialOverride?: number;
  transportOriginal?: number;
  transportMarkup?: number; // percent (editable in Planning)
  /** Base unit price from API — never changes, used in computeUnitPrice formula. */
  transportBaseUnitPrice?: number;
  /** Override — use BE's unitPriceRab directly instead of computed value. */
  transportUnitPriceOverride?: number;
  /** Override — use BE's totalCostTransport directly. */
  totalTransportOverride?: number;
  /** Override — use BE's amount directly instead of computed sum. */
  amountOverride?: number;
}

/** Resume Equipment Cost — one input row. Derived columns never stored. */
export interface BOQResumeEquipmentRow extends BOQCostRow {
  vol?: number;
  volCco?: number;
  volAct?: number;
  satuan?: string;
  duration?: number;
  durationUoM?: string;
  equipmentOriginal?: number;
  equipmentMarkup?: number; // percent (editable in Planning)
  /** Base unit price from API — never changes, used in computeUnitPrice formula. */
  equipmentBaseUnitPrice?: number;
  /** Override — use BE's unitPriceRab directly. */
  equipmentUnitPriceOverride?: number;
  /** Override — use BE's totalCostEquipment directly. */
  totalEquipmentOverride?: number;
  transportOriginal?: number;
  transportMarkup?: number; // percent (editable in Planning)
  /** Base unit price from API — never changes, used in computeUnitPrice formula. */
  transportBaseUnitPrice?: number;
  /** Override — use BE's unitPriceRab directly. */
  transportUnitPriceOverride?: number;
  /** Override — use BE's totalCostTransport directly. */
  totalTransportOverride?: number;
  /** Override — use BE's amount directly. */
  amountOverride?: number;
}

export interface BOQResumeMaterialSection {
  value: 'material_transport';
  label: string;
  rows: BOQResumeMaterialRow[];
  searchPlaceholder?: string;
}

export interface BOQResumeEquipmentSection {
  value: 'equipment';
  label: string;
  rows: BOQResumeEquipmentRow[];
  searchPlaceholder?: string;
}

export function createEmptyResumeMaterialRow(): BOQResumeMaterialRow {
  return { id: generateId(), code: '', name: '' };
}

export function createEmptyResumeEquipmentRow(): BOQResumeEquipmentRow {
  return { id: generateId(), code: '', name: '' };
}
