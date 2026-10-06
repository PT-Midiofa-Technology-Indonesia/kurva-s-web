import type { BOQPlanningNode } from '../types/boq-planning.types';

function getLeafTotalPrice(
  node: BOQPlanningNode
): { material?: number; work?: number } | undefined {
  const mat = node.unitPrices?.work?.materialRab;
  const wrk = node.unitPrices?.work?.workRab;
  if (mat == null && wrk == null) return undefined;
  return { material: mat, work: wrk };
}

function sumChildrenTotalPrice(
  node: BOQPlanningNode,
  selector: 'material' | 'work'
): number | undefined {
  if (node.children.length === 0) return undefined;
  let sum = 0;
  let hasAny = false;
  for (const child of node.children) {
    const childTotal =
      selector === 'material' ? computeTotalPriceMaterial(child) : computeTotalPriceWork(child);
    if (childTotal != null) {
      sum += childTotal;
      hasAny = true;
    }
  }
  return hasAny ? sum : undefined;
}

/** Total Price / Material column. Leaf: stored total in unitPrices.work. Parent: if has volume → unitPrice * volume, else → unitPrice (sum of children totals). */
export function computeTotalPriceMaterial(node: BOQPlanningNode): number | undefined {
  if (node.children.length === 0) {
    const leafTotal = getLeafTotalPrice(node);
    return leafTotal?.material;
  }
  const unitPrice = computeUnitPriceMaterial(node);
  const vol = node.volume?.rab;
  if (unitPrice == null) return undefined;
  return vol != null ? unitPrice * vol : unitPrice;
}

/** Total Price / Work column. Leaf: stored total in unitPrices.work. Parent: if has volume → unitPrice * volume, else → unitPrice (sum of children totals). */
export function computeTotalPriceWork(node: BOQPlanningNode): number | undefined {
  if (node.children.length === 0) {
    const leafTotal = getLeafTotalPrice(node);
    return leafTotal?.work;
  }
  const unitPrice = computeUnitPriceWork(node);
  const vol = node.volume?.rab;
  if (unitPrice == null) return undefined;
  return vol != null ? unitPrice * vol : unitPrice;
}

/**
 * Amount column. Leaf: its own stored value (may be independently overridden via
 * copy/paste, so it is never re-derived from totals). Parent: sum of its own
 * computed Total Price Material + Total Price Work.
 */
export function computeAmount(node: BOQPlanningNode): number | undefined {
  if (node.children.length === 0) return node.amount?.rab;
  const material = computeTotalPriceMaterial(node);
  const work = computeTotalPriceWork(node);
  if (material === undefined && work === undefined) return undefined;
  return (material ?? 0) + (work ?? 0);
}

/** Unit Price / Material column. Leaf: stored value. Parent: sum of children's Total Price Material. */
export function computeUnitPriceMaterial(node: BOQPlanningNode): number | undefined {
  if (node.children.length === 0) return node.unitPrices?.material?.materialRab;
  return sumChildrenTotalPrice(node, 'material');
}

/** Unit Price / Work column. Leaf: stored value. Parent: sum of children's Total Price Work. */
export function computeUnitPriceWork(node: BOQPlanningNode): number | undefined {
  if (node.children.length === 0) return node.unitPrices?.material?.workRab;
  return sumChildrenTotalPrice(node, 'work');
}
