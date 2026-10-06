import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { generateId } from '@/shared/utils/generate-id';
import type { ScheduleNode } from './types';

// ─── Code generation ──────────────────────────────────────────────────────────

function rootLetter(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function computeCodes(nodes: ScheduleNode[]): Map<string, string> {
  const codes = new Map<string, string>();
  const walk = (list: ScheduleNode[], parentCode: string | null) => {
    list.forEach((n, i) => {
      const code = parentCode === null ? rootLetter(i) : `${parentCode}.${i + 1}`;
      codes.set(n.id, code);
      if (n.children.length > 0) walk(n.children, code);
    });
  };
  walk(nodes, null);
  return codes;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createEmptyScheduleNode(
  patch?: Partial<Omit<ScheduleNode, 'children'>>
): ScheduleNode {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    id: generateId(),
    taskName: '',
    startDate: today,
    endDate: today,
    days: 1,
    bobot: null,
    percent: 0,
    children: [],
    ...patch,
  };
}

// ─── Tree mutation helpers ────────────────────────────────────────────────────

export function updateNode(
  nodes: ScheduleNode[],
  id: string,
  patch: Partial<ScheduleNode>
): ScheduleNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children.length) return { ...n, children: updateNode(n.children, id, patch) };
    return n;
  });
}

export function findNode(nodes: ScheduleNode[], id: string): ScheduleNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return undefined;
}

function getChildrenBounds(
  children: ScheduleNode[]
): { startDate: string; endDate: string } | null {
  if (children.length === 0) return null;
  const startDate = children.reduce(
    (min, child) => (child.startDate < min ? child.startDate : min),
    children[0].startDate
  );
  const endDate = children.reduce(
    (max, child) => (child.endDate > max ? child.endDate : max),
    children[0].endDate
  );
  return { startDate, endDate };
}

export function constrainParentDates(
  node: ScheduleNode,
  patch: Pick<ScheduleNode, 'startDate' | 'endDate'>
): Pick<ScheduleNode, 'startDate' | 'endDate'> {
  const bounds = getChildrenBounds(node.children);
  if (!bounds) return patch;
  return {
    startDate: patch.startDate > bounds.startDate ? bounds.startDate : patch.startDate,
    endDate: patch.endDate < bounds.endDate ? bounds.endDate : patch.endDate,
  };
}

export function recalcParentDates(nodes: ScheduleNode[]): ScheduleNode[] {
  return nodes.map((node) => {
    const children = recalcParentDates(node.children);
    const bounds = getChildrenBounds(children);
    if (!bounds) return { ...node, children };
    return { ...node, ...bounds, children };
  });
}

export function buildLeafDependencies(_nodes: ScheduleNode[]): Map<string, string[]> {
  // Return empty map - no arrows for leaf nodes as per requirement
  // Arrows should only appear on parent nodes that have children
  const dependencies = new Map<string, string[]>();
  return dependencies;
}

export function addChild(nodes: ScheduleNode[], id: string, child: ScheduleNode): ScheduleNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, children: [...n.children, child] };
    if (n.children.length) return { ...n, children: addChild(n.children, id, child) };
    return n;
  });
}

export function addSibling(
  nodes: ScheduleNode[],
  id: string,
  position: 'above' | 'below',
  sibling: ScheduleNode
): ScheduleNode[] {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    const at = position === 'below' ? idx + 1 : idx;
    const copy = [...nodes];
    copy.splice(at, 0, sibling);
    return copy;
  }
  return nodes.map((n) =>
    n.children.length ? { ...n, children: addSibling(n.children, id, position, sibling) } : n
  );
}

export function deleteNode(nodes: ScheduleNode[], id: string): ScheduleNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children.length ? { ...n, children: deleteNode(n.children, id) } : n));
}

/** Strips `isDraft` from every node in the tree, recursively. */
export function clearDraftFlags(nodes: ScheduleNode[]): ScheduleNode[] {
  return nodes.map((n) => ({
    ...n,
    isDraft: undefined,
    children: clearDraftFlags(n.children),
  }));
}

/** Inclusive day count between startDate and endDate (ISO yyyy-MM-dd), minimum 1. */
export function computeDays(node: ScheduleNode): number {
  const diff = differenceInCalendarDays(parseISO(node.endDate), parseISO(node.startDate)) + 1;
  return Math.max(diff, 1);
}

/** Recalculate days for every node in the tree. */
export function recalcDays(nodes: ScheduleNode[]): ScheduleNode[] {
  return nodes.map((n) => ({
    ...n,
    days: computeDays(n),
    children: recalcDays(n.children),
  }));
}

/** Returns true if node has no children (is a true leaf node). */
export function isLastLeaf(node: ScheduleNode): boolean {
  return node.children.length === 0;
}

/**
 * Shifts a node and all its descendants by deltaDays.
 * Used when parent is moved (not resized) so children follow.
 */
export function shiftNodeAndChildren(node: ScheduleNode, deltaDays: number): ScheduleNode {
  const shiftDate = (iso: string) => format(addDays(parseISO(iso), deltaDays), 'yyyy-MM-dd');
  return {
    ...node,
    startDate: shiftDate(node.startDate),
    endDate: shiftDate(node.endDate),
    children: node.children.map((c) => shiftNodeAndChildren(c, deltaDays)),
  };
}

/**
 * Applies shiftNodeAndChildren to a node by id within the tree.
 */
export function shiftNodeById(
  nodes: ScheduleNode[],
  id: string,
  deltaDays: number
): ScheduleNode[] {
  return nodes.map((n) => {
    if (n.id === id) return shiftNodeAndChildren(n, deltaDays);
    if (n.children.length) return { ...n, children: shiftNodeById(n.children, id, deltaDays) };
    return n;
  });
}
