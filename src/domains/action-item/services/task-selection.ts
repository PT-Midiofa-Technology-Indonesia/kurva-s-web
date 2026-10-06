export interface SelectableTaskNode {
  id: string;
  isDelegatable?: boolean;
  children: SelectableTaskNode[];
}

export function buildDescendantIdMap(nodes: SelectableTaskNode[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  function collect(node: SelectableTaskNode): string[] {
    const descendantIds: string[] = [];

    for (const child of node.children) {
      descendantIds.push(child.id, ...collect(child));
    }

    map.set(node.id, descendantIds);
    return descendantIds;
  }

  for (const node of nodes) {
    collect(node);
  }

  return map;
}

export function getSelectableIds(nodes: SelectableTaskNode[]): Set<string> {
  const ids = new Set<string>();

  function collect(currentNodes: SelectableTaskNode[]) {
    for (const node of currentNodes) {
      if (node.isDelegatable !== false) ids.add(node.id);
      collect(node.children);
    }
  }

  collect(nodes);
  return ids;
}

export function getCascadeSelectionIds(
  id: string,
  descendantIdsById: Map<string, string[]>,
  selectableIds: Set<string>
): string[] {
  return [id, ...(descendantIdsById.get(id) ?? [])].filter((currentId) =>
    selectableIds.has(currentId)
  );
}
