import type { BOQNode } from '@/shared/components/templates/BOQ/types/boq-tree.types';

export interface FlattenedItem {
  id: string | null;
  tempId: string | null;
  parentId: string | null;
  parentTempId: string | null;
  sortOrder: number;
  name: string;
  jobItemTypeId: string;
  isFinalLevel: boolean;
  weight: number;
  isActive: boolean;
  suggestionItemId: string | null;
}

export interface OriginalItem {
  jobItemType: { id: string };
  weight?: string | null;
  suggestionItemId?: string | null;
}

export function flattenTree(
  nodes: BOQNode[],
  parentId: string | null,
  parentTempId: string | null,
  originalMap: Map<string, OriginalItem>,
  newIds: Set<string>,
  getJobItemTypeId?: (node: BOQNode, original?: OriginalItem) => string
): FlattenedItem[] {
  const result: FlattenedItem[] = [];
  nodes.forEach((node, index) => {
    const original = originalMap.get(node.id);
    const isExisting = newIds.has(node.id);
    const item: FlattenedItem = {
      id: isExisting ? node.id : null,
      tempId: isExisting ? null : node.id,
      parentId,
      parentTempId,
      sortOrder: index + 1,
      name: node.name,
      jobItemTypeId: getJobItemTypeId
        ? getJobItemTypeId(node, original)
        : (original?.jobItemType.id ?? ''),
      isFinalLevel: node.isFinalLevel ?? node.children.length === 0,
      weight: node.bobot ?? 0,
      isActive: true,
      suggestionItemId: node.suggestionItemId ?? original?.suggestionItemId ?? null,
    };
    result.push(item);
    if (node.children.length > 0) {
      const childItems = flattenTree(
        node.children,
        isExisting ? node.id : null,
        isExisting ? null : node.id,
        originalMap,
        newIds,
        getJobItemTypeId
      );
      result.push(...childItems);
    }
  });
  return result;
}

export function collectAllIds(nodes: BOQNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (list: BOQNode[]) => {
    for (const n of list) {
      ids.add(n.id);
      if (n.children.length > 0) walk(n.children);
    }
  };
  walk(nodes);
  return ids;
}
