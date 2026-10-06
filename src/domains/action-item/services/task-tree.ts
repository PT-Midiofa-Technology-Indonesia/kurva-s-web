/**
 * Rebuilds the parent/child hierarchy the API only expresses implicitly.
 *
 * `GET /meeting-tasks/tasks` returns a FLAT list; the hierarchy lives in the
 * dot-segmented `code` ("A.1"'s parent is the row coded "A") — the same
 * convention the MoM domain reconstructs in `unflattenTasksToTodoTree`.
 * `DataTable` with `enableTreeView` reads sub-rows from `children`, so the flat
 * list has to be nested before it can render collapsible sub-tasks.
 *
 * A row whose parent code is absent from the current page (server-side
 * pagination can split a parent from its children) stays at root level, so
 * pagination can never make a row disappear entirely.
 */
export type TaskTreeNode<T> = T & { children: TaskTreeNode<T>[] };

export function buildTaskTree<T extends { code: string }>(rows: T[]): TaskTreeNode<T>[] {
  // Shortest/lowest codes first so a parent is always registered before the
  // children that look it up ("A" < "A.1" < "A.2" < "A.10" < "B").
  const sorted = [...rows].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );

  const nodesByCode = new Map<string, TaskTreeNode<T>>();
  const roots: TaskTreeNode<T>[] = [];

  for (const row of sorted) {
    const node = { ...row, children: [] } as TaskTreeNode<T>;
    nodesByCode.set(row.code, node);

    const lastDotIndex = row.code.lastIndexOf('.');
    const parent =
      lastDotIndex === -1 ? undefined : nodesByCode.get(row.code.slice(0, lastDotIndex));

    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  return roots;
}
