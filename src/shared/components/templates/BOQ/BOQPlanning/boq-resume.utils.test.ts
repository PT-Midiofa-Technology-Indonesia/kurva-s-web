import { describe, expect, it } from 'vitest';
import type { BOQResumeEquipmentRow, BOQResumeMaterialRow } from './boq-resume.types';
import {
  computeEquipmentRow,
  computeMaterialRow,
  computeUnitPrice,
  sumEquipmentAmount,
  sumMaterialAmount,
} from './boq-resume.utils';

describe('computeUnitPrice', () => {
  it('applies percent markup', () => {
    expect(computeUnitPrice(400000, 400000, 25)).toBe(500000);
    expect(computeUnitPrice(80000, 80000, 20)).toBe(96000);
  });
  it('treats missing markup as 0%', () => {
    expect(computeUnitPrice(1000, 1000, undefined)).toBe(1000);
  });
  it('returns undefined when base price is missing', () => {
    expect(computeUnitPrice(undefined, 1000, 25)).toBeUndefined();
  });
  it('does not round fractional results', () => {
    expect(computeUnitPrice(333, 333, 10)).toBeCloseTo(366.3, 5);
    expect(computeUnitPrice(10, 10, 33)).toBeCloseTo(13.3, 5);
  });
});

describe('computeMaterialRow', () => {
  it('computes unit prices, totals and amount', () => {
    const row: BOQResumeMaterialRow = {
      id: 'm',
      code: 'M.232',
      name: 'Pasir Kali',
      vol: 50,
      satuan: 'm3',
      materialBaseUnitPrice: 400000,
      materialOriginal: 400000,
      materialMarkup: 25,
      transportBaseUnitPrice: 20000,
      transportOriginal: 20000,
      transportMarkup: 40,
    };
    const r = computeMaterialRow(row);
    expect(r.materialUnitPrice).toBeCloseTo(500000, 5);
    expect(r.transportUnitPrice).toBeCloseTo(28000, 5);
    expect(r.totalMaterial).toBeCloseTo(25000000, 5); // 500000 * 50
    expect(r.totalTransport).toBeCloseTo(1400000, 5); // 28000 * 50
    expect(r.amount).toBeCloseTo(26400000, 5);
  });
  it('returns undefined fields when inputs are entirely missing', () => {
    const r = computeMaterialRow({ id: 'x', code: '', name: '' });
    expect(r.materialUnitPrice).toBeUndefined();
    expect(r.transportUnitPrice).toBeUndefined();
    expect(r.totalMaterial).toBeUndefined();
    expect(r.totalTransport).toBeUndefined();
    expect(r.amount).toBeUndefined();
  });
});

describe('computeEquipmentRow', () => {
  it('multiplies equipment total by duration', () => {
    const row: BOQResumeEquipmentRow = {
      id: 'e',
      code: 'E.567',
      name: 'Crane',
      vol: 1,
      satuan: 'unit',
      duration: 200,
      durationUoM: 'jam',
      equipmentBaseUnitPrice: 200000,
      equipmentOriginal: 200000,
      equipmentMarkup: 10,
      transportBaseUnitPrice: 220000,
      transportOriginal: 220000,
      transportMarkup: 40,
    };
    const r = computeEquipmentRow(row);
    expect(r.equipmentUnitPrice).toBeCloseTo(220000, 5);
    expect(r.totalEquipment).toBeCloseTo(44000000, 5); // 220000 * 1 * 200
    expect(r.transportUnitPrice).toBeCloseTo(308000, 5);
    expect(r.totalTransport).toBeCloseTo(308000, 5); // 308000 * 1 (no duration)
    expect(r.amount).toBeCloseTo(44308000, 5);
  });
});

describe('sum helpers', () => {
  it('sums material amounts', () => {
    const rows: BOQResumeMaterialRow[] = [
      {
        id: '1',
        code: '',
        name: '',
        vol: 1,
        materialBaseUnitPrice: 100,
        materialOriginal: 100,
        materialMarkup: 0,
      },
      {
        id: '2',
        code: '',
        name: '',
        vol: 2,
        materialBaseUnitPrice: 100,
        materialOriginal: 100,
        materialMarkup: 0,
      },
    ];
    expect(sumMaterialAmount(rows)).toBe(300);
  });
  it('sums equipment amounts', () => {
    const rows: BOQResumeEquipmentRow[] = [
      {
        id: '1',
        code: '',
        name: '',
        vol: 1,
        duration: 1,
        equipmentBaseUnitPrice: 100,
        equipmentOriginal: 100,
        equipmentMarkup: 0,
      },
    ];
    expect(sumEquipmentAmount(rows)).toBe(100);
  });
});
