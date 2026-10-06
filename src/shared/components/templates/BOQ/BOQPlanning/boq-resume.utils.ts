import type { BOQResumeEquipmentRow, BOQResumeMaterialRow } from './boq-resume.types';

/**
 * Compute unit price: baseUnitPrice + (markup/100) × original.
 * When original=0, markup=0 → returns baseUnitPrice.
 */
export function computeUnitPrice(
  baseUnitPrice?: number,
  original?: number,
  markup?: number
): number | undefined {
  if (baseUnitPrice == null) return undefined;
  return baseUnitPrice + ((markup ?? 0) / 100) * (original ?? 0);
}

function product(...vals: Array<number | undefined>): number | undefined {
  if (vals.some((v) => v == null)) return undefined;
  return vals.reduce<number>((acc, v) => acc * (v ?? 0), 1);
}

function sum(...vals: Array<number | undefined>): number | undefined {
  if (vals.every((v) => v == null)) return undefined;
  return vals.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

export interface ComputedMaterialRow {
  materialUnitPrice?: number;
  transportUnitPrice?: number;
  totalMaterial?: number;
  totalTransport?: number;
  amount?: number;
}

export function computeMaterialRow(row: BOQResumeMaterialRow): ComputedMaterialRow {
  const materialUnitPrice =
    row.materialUnitPriceOverride ??
    computeUnitPrice(row.materialBaseUnitPrice, row.materialOriginal, row.materialMarkup);
  const transportUnitPrice =
    row.transportUnitPriceOverride ??
    computeUnitPrice(row.transportBaseUnitPrice, row.transportOriginal, row.transportMarkup);
  const totalMaterial = row.totalMaterialOverride ?? product(materialUnitPrice, row.vol);
  const totalTransport = row.totalTransportOverride ?? product(transportUnitPrice, row.vol);
  const amount = row.amountOverride ?? sum(totalMaterial, totalTransport);
  return { materialUnitPrice, transportUnitPrice, totalMaterial, totalTransport, amount };
}

export interface ComputedEquipmentRow {
  equipmentUnitPrice?: number;
  transportUnitPrice?: number;
  totalEquipment?: number;
  totalTransport?: number;
  amount?: number;
}

export function computeEquipmentRow(row: BOQResumeEquipmentRow): ComputedEquipmentRow {
  const equipmentUnitPrice =
    row.equipmentUnitPriceOverride ??
    computeUnitPrice(row.equipmentBaseUnitPrice, row.equipmentOriginal, row.equipmentMarkup);
  const transportUnitPrice =
    row.transportUnitPriceOverride ??
    computeUnitPrice(row.transportBaseUnitPrice, row.transportOriginal, row.transportMarkup);
  const totalEquipment =
    row.totalEquipmentOverride ?? product(equipmentUnitPrice, row.vol, row.duration);
  const totalTransport = row.totalTransportOverride ?? product(transportUnitPrice, row.vol);
  const amount = row.amountOverride ?? sum(totalEquipment, totalTransport);
  return { equipmentUnitPrice, transportUnitPrice, totalEquipment, totalTransport, amount };
}

export function sumMaterialAmount(rows: BOQResumeMaterialRow[]): number {
  return rows.reduce((acc, r) => acc + (computeMaterialRow(r).amount ?? 0), 0);
}

export function sumEquipmentAmount(rows: BOQResumeEquipmentRow[]): number {
  return rows.reduce((acc, r) => acc + (computeEquipmentRow(r).amount ?? 0), 0);
}

/**
 * Apply cell edit for a material resume row — patches the source field and
 * immediately recomputes derived values into the row. Same pattern as
 * `BOQPlanningDetail.handleCellEdit` (edit source → recompute → push).
 *
 * Returns a complete new row object, not a partial.
 */
export function applyMaterialCellEdit(
  row: BOQResumeMaterialRow,
  columnId: string,
  rawVal: unknown
): BOQResumeMaterialRow {
  const num = rawVal !== '' && rawVal != null ? Number(rawVal) : undefined;
  const str = rawVal != null ? String(rawVal) : '';

  const patched = { ...row };

  if (columnId === 'code') patched.code = str;
  else if (columnId === 'name') patched.name = str;
  else if (columnId === 'vol_rab') patched.vol = num;
  else if (columnId === 'vol_cco') patched.volCco = num;
  else if (columnId === 'satuan') patched.satuan = str;
  else if (columnId === 'materialOriginal') patched.materialOriginal = num;
  else if (columnId === 'materialMarkup') patched.materialMarkup = num;
  else if (columnId === 'transportOriginal') patched.transportOriginal = num;
  else if (columnId === 'transportMarkup') patched.transportMarkup = num;
  else return patched; // nothing to recompute

  // Clear all overrides so computeMaterialRow uses the fresh source values
  patched.materialUnitPriceOverride = undefined;
  patched.transportUnitPriceOverride = undefined;
  patched.totalMaterialOverride = undefined;
  patched.totalTransportOverride = undefined;
  patched.amountOverride = undefined;

  // Bake the newly computed values back into the overrides
  // so the table simply reads them out as if the BE sent them.
  const computed = computeMaterialRow(patched);
  patched.materialUnitPriceOverride = computed.materialUnitPrice;
  patched.transportUnitPriceOverride = computed.transportUnitPrice;
  patched.totalMaterialOverride = computed.totalMaterial;
  patched.totalTransportOverride = computed.totalTransport;
  patched.amountOverride = computed.amount;

  return patched;
}

/**
 * Apply cell edit for an equipment resume row — same pattern.
 */
export function applyEquipmentCellEdit(
  row: BOQResumeEquipmentRow,
  columnId: string,
  rawVal: unknown
): BOQResumeEquipmentRow {
  const num = rawVal !== '' && rawVal != null ? Number(rawVal) : undefined;
  const str = rawVal != null ? String(rawVal) : '';

  const patched = { ...row };

  if (columnId === 'code') patched.code = str;
  else if (columnId === 'name') patched.name = str;
  else if (columnId === 'vol_rab') patched.vol = num;
  else if (columnId === 'vol_cco') patched.volCco = num;
  else if (columnId === 'satuan') patched.satuan = str;
  else if (columnId === 'duration_rab') patched.duration = num;
  else if (columnId === 'durationUoM') patched.durationUoM = str;
  else if (columnId === 'equipmentOriginal') patched.equipmentOriginal = num;
  else if (columnId === 'equipmentMarkup') patched.equipmentMarkup = num;
  else if (columnId === 'transportOriginal') patched.transportOriginal = num;
  else if (columnId === 'transportMarkup') patched.transportMarkup = num;
  else return patched; // nothing to recompute

  // Clear all overrides so computeEquipmentRow uses fresh source values
  patched.equipmentUnitPriceOverride = undefined;
  patched.transportUnitPriceOverride = undefined;
  patched.totalEquipmentOverride = undefined;
  patched.totalTransportOverride = undefined;
  patched.amountOverride = undefined;

  // Bake computed values
  const computed = computeEquipmentRow(patched);
  patched.equipmentUnitPriceOverride = computed.equipmentUnitPrice;
  patched.transportUnitPriceOverride = computed.transportUnitPrice;
  patched.totalEquipmentOverride = computed.totalEquipment;
  patched.totalTransportOverride = computed.totalTransport;
  patched.amountOverride = computed.amount;

  return patched;
}
