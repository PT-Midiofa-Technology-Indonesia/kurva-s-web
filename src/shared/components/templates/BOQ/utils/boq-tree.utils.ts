import { generateId } from '@/shared/utils/generate-id';
import type { BOQNode } from '../types/boq-tree.types';
import { DEFAULT_JENIS_OPTIONS } from '../types/boq-tree.types';

/** 0 -> "A", 25 -> "Z", 26 -> "AA" (spreadsheet column letters). */
export function rootLetter(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

/** Build id -> derived code map from tree position. Codes are never stored. */
export function computeCodes(nodes: BOQNode[]): Map<string, string> {
  const codes = new Map<string, string>();
  const walk = (list: BOQNode[], parentCode: string | null) => {
    list.forEach((n, i) => {
      const code = parentCode === null ? rootLetter(i) : `${parentCode}.${i + 1}`;
      codes.set(n.id, code);
      if (n.children.length > 0) walk(n.children, code);
    });
  };
  walk(nodes, null);
  return codes;
}

export function createEmptyNode(opts?: { isDraft?: boolean; jenis?: string }): BOQNode {
  return {
    id: generateId(),
    name: '',
    jenis: opts?.jenis ?? DEFAULT_JENIS_OPTIONS[0].value,
    bobot: null,
    children: [],
    suggestionItemId: null,
    ...(opts?.isDraft ? { isDraft: true } : {}),
  };
}

export function cloneNode(n: BOQNode): BOQNode {
  return {
    ...n,
    id: generateId(),
    // Track which suggestion item this clone came from (null when not from a suggestion)
    suggestionItemId: n.suggestionItemId ?? n.id,
    children: n.children.map(cloneNode),
  };
}

export function findDepth(nodes: BOQNode[], id: string, depth = 0): number {
  for (const n of nodes) {
    if (n.id === id) return depth;
    const d = findDepth(n.children, id, depth + 1);
    if (d !== -1) return d;
  }
  return -1;
}

export function canAddChild(nodes: BOQNode[], id: string, maxDepth: number): boolean {
  const depth = findDepth(nodes, id);
  if (depth === -1) return false;
  // depth is 0-based; a child sits at depth+1, which must be <= maxDepth-1
  return depth + 1 <= maxDepth - 1;
}

export function addChild(nodes: BOQNode[], id: string, child: BOQNode): BOQNode[] {
  return nodes.map((n) => {
    // Adding a child demotes the parent from final level
    if (n.id === id) return { ...n, isFinalLevel: false, children: [...n.children, child] };
    if (n.children.length) return { ...n, children: addChild(n.children, id, child) };
    return n;
  });
}

export function addSibling(
  nodes: BOQNode[],
  id: string,
  position: 'above' | 'below',
  sibling: BOQNode
): BOQNode[] {
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

export function deleteNode(nodes: BOQNode[], id: string): BOQNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children.length ? { ...n, children: deleteNode(n.children, id) } : n));
}

export function moveToBottom(nodes: BOQNode[], id: string): BOQNode[] {
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    const copy = [...nodes];
    const [moved] = copy.splice(idx, 1);
    copy.push(moved);
    return copy;
  }
  return nodes.map((n) =>
    n.children.length ? { ...n, children: moveToBottom(n.children, id) } : n
  );
}

/**
 * Recursively compute effective bobot for a node.
 * Leaf nodes return their stored bobot (editable).
 * Parent nodes return the sum of their children's effective bobot.
 * Returns null only when every descendant leaf has null bobot.
 */
export function computeBobot(node: BOQNode): number | null {
  if (node.children.length === 0) return node.bobot;
  const childSums = node.children.map(computeBobot);
  if (childSums.every((b) => b === null)) return null;
  const sum = childSums.reduce<number>((sum, b) => sum + (b ?? 0), 0);
  // ponytail: strips float artifacts (10.1 + 10.2 → 20.299999…); bump precision if bobot ever needs >10 dp
  return Number(sum.toFixed(10));
}

export function findNodeByName(nodes: BOQNode[], name: string): BOQNode | undefined {
  for (const n of nodes) {
    if (n.name === name) return n;
    const found = findNodeByName(n.children, name);
    if (found) return found;
  }
  return undefined;
}

export function replaceNode(nodes: BOQNode[], id: string, replacement: BOQNode): BOQNode[] {
  return nodes.map((n) => {
    if (n.id === id) return replacement;
    if (n.children.length) return { ...n, children: replaceNode(n.children, id, replacement) };
    return n;
  });
}

export function updateNode(nodes: BOQNode[], id: string, patch: Partial<BOQNode>): BOQNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children.length) return { ...n, children: updateNode(n.children, id, patch) };
    return n;
  });
}

export function setFinalLevel(nodes: BOQNode[], id: string): BOQNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, isFinalLevel: true, children: [] };
    if (n.children.length) return { ...n, children: setFinalLevel(n.children, id) };
    return n;
  });
}

/**
 * When a child is added to a node, unset isFinalLevel on the parent.
 * Call this before addChild to ensure parent's isFinalLevel is cleared.
 */
export function unsetParentFinalLevel(nodes: BOQNode[], childId: string): BOQNode[] {
  const parentId = findParentId(nodes, childId);
  if (!parentId) return nodes;
  return updateNode(nodes, parentId, { isFinalLevel: false });
}

export function findParentId(
  nodes: BOQNode[],
  childId: string,
  parentId: string | null = null
): string | null {
  for (const n of nodes) {
    if (n.id === childId) return parentId;
    if (n.children.length) {
      const found = findParentId(n.children, childId, n.id);
      if (found !== null) return found;
    }
  }
  return null;
}
