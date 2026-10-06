import { describe, expect, it } from 'vitest';
import type { BOQPlanningNode } from '../types/boq-planning.types';
import {
  computeAmount,
  computeTotalPriceMaterial,
  computeTotalPriceWork,
  computeUnitPriceMaterial,
  computeUnitPriceWork,
} from './boq-planning-rollup.utils';

const leaf = (
  id: string,
  opts: { materialRab?: number; workRab?: number; amountRab?: number; volumeRab?: number } = {}
): BOQPlanningNode => ({
  id,
  name: id,
  jenis: 'Job',
  bobot: null,
  children: [],
  volume: opts.volumeRab != null ? { rab: opts.volumeRab } : undefined,
  unitPrices:
    opts.materialRab != null || opts.workRab != null
      ? { work: { materialRab: opts.materialRab, workRab: opts.workRab } }
      : undefined,
  amount: opts.amountRab != null ? { rab: opts.amountRab } : undefined,
});

const parent = (id: string, children: BOQPlanningNode[], volumeRab?: number): BOQPlanningNode => ({
  id,
  name: id,
  jenis: 'Job',
  bobot: null,
  children,
  volume: volumeRab != null ? { rab: volumeRab } : undefined,
});

describe('computeTotalPriceMaterial / computeTotalPriceWork', () => {
  it('returns the stored total price for a leaf node', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    expect(computeTotalPriceMaterial(granit)).toBe(370_000);
    expect(computeTotalPriceWork(granit)).toBe(2_300_000);
  });

  it('sums direct children for a single-level parent', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const variasi = leaf('variasi', { materialRab: 120_000, workRab: 56_000 });
    const lorem = leaf('lorem');
    const batuBata = parent('batuBata', [granit, variasi, lorem], 1);
    expect(computeTotalPriceMaterial(batuBata)).toBe(490_000);
    expect(computeTotalPriceWork(batuBata)).toBe(2_356_000);
  });

  it('cascades through multiple levels', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const variasi = leaf('variasi', { materialRab: 120_000, workRab: 56_000 });
    const lorem = leaf('lorem');
    const batuBata = parent('A.1.1.1', [granit, variasi, lorem], 1);
    const areaLoby = parent('A.1.1', [batuBata], 1);
    const civil = parent('A.1', [areaLoby]);
    const root = parent('A', [civil]);
    expect(computeTotalPriceMaterial(root)).toBe(490_000);
    expect(computeTotalPriceWork(root)).toBe(2_356_000);
  });

  it('returns undefined when every descendant leaf is undefined', () => {
    const emptyParent = parent('empty', [leaf('lorem1'), leaf('lorem2')]);
    expect(computeTotalPriceMaterial(emptyParent)).toBeUndefined();
    expect(computeTotalPriceWork(emptyParent)).toBeUndefined();
  });

  it('treats an undefined sibling as 0 when at least one child has a value', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const mixedParent = parent('mixed', [granit, leaf('lorem')]);
    expect(computeTotalPriceMaterial(mixedParent)).toBe(370_000);
    expect(computeTotalPriceWork(mixedParent)).toBe(2_300_000);
  });
});

describe('computeAmount', () => {
  it('returns the leaf own stored amount, even if it does not match its totals', () => {
    const overridden = leaf('overridden', { materialRab: 100, workRab: 100, amountRab: 999 });
    expect(computeAmount(overridden)).toBe(999);
  });

  it('sums total price material and total price work for a parent', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const variasi = leaf('variasi', { materialRab: 120_000, workRab: 56_000 });
    const lorem = leaf('lorem');
    const batuBata = parent('batuBata', [granit, variasi, lorem], 1);
    expect(computeAmount(batuBata)).toBe(2_846_000);
  });

  it('returns undefined for a parent when both totals are undefined', () => {
    const emptyParent = parent('empty', [leaf('lorem1'), leaf('lorem2')]);
    expect(computeAmount(emptyParent)).toBeUndefined();
  });
});

describe('computeUnitPriceMaterial / computeUnitPriceWork', () => {
  it('returns the stored unit price for a leaf node, unchanged', () => {
    const granit: BOQPlanningNode = {
      id: 'granit',
      name: 'granit',
      jenis: 'Job',
      bobot: null,
      children: [],
      unitPrices: { material: { materialRab: 370_000, workRab: 2_300_000 } },
    };
    expect(computeUnitPriceMaterial(granit)).toBe(370_000);
    expect(computeUnitPriceWork(granit)).toBe(2_300_000);
  });

  it('divides the parent own total price by the parent own volume', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const variasi = leaf('variasi', { materialRab: 120_000, workRab: 56_000 });
    const lorem = leaf('lorem');
    const batuBata = parent('batuBata', [granit, variasi, lorem], 1);
    expect(computeUnitPriceMaterial(batuBata)).toBe(490_000);
    expect(computeUnitPriceWork(batuBata)).toBe(2_356_000);
  });

  it('returns the sum of children totals as unit price, regardless of parent volume', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const batuBata = parent('batuBata', [granit]);
    expect(computeUnitPriceMaterial(batuBata)).toBe(370_000);
    expect(computeUnitPriceWork(batuBata)).toBe(2_300_000);
  });

  it('returns the sum of children totals as unit price when parent volume is 0', () => {
    const granit = leaf('granit', { materialRab: 370_000, workRab: 2_300_000 });
    const batuBata = parent('batuBata', [granit], 0);
    expect(computeUnitPriceMaterial(batuBata)).toBe(370_000);
    expect(computeUnitPriceWork(batuBata)).toBe(2_300_000);
  });
});
