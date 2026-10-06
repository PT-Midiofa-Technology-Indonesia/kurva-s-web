import { generateId } from '@/shared/utils/generate-id';
import { GENERAL_TODO_TAB_ID } from '../constants';
import type { MomTodoByTab, TodoNode } from '../types';
import type { MeetingTaskApiResponse } from '../types/api';

export const TODO_MAX_DEPTH = 5;

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
export function computeTodoCodes(nodes: TodoNode[]): Map<string, string> {
  const codes = new Map<string, string>();
  const walk = (list: TodoNode[], parentCode: string | null) => {
    list.forEach((node, index) => {
      const code = parentCode === null ? rootLetter(index) : `${parentCode}.${index + 1}`;
      codes.set(node.id, code);
      if (node.children.length > 0) walk(node.children, code);
    });
  };
  walk(nodes, null);
  return codes;
}

export function createEmptyTodoNode(): TodoNode {
  return {
    id: generateId(),
    task: '',
    taskType: 'work',
    assignedToEmployeeId: null,
    assignedToEmployeeName: null,
    children: [],
  };
}

export function cloneTodoNode(node: TodoNode): TodoNode {
  return { ...node, id: generateId(), children: node.children.map(cloneTodoNode) };
}

export function findTodoDepth(nodes: TodoNode[], id: string, depth = 0): number {
  for (const node of nodes) {
    if (node.id === id) return depth;
    const found = findTodoDepth(node.children, id, depth + 1);
    if (found !== -1) return found;
  }
  return -1;
}

export function canAddTodoChild(nodes: TodoNode[], id: string, maxDepth = TODO_MAX_DEPTH): boolean {
  const depth = findTodoDepth(nodes, id);
  if (depth === -1) return false;
  return depth + 1 <= maxDepth - 1;
}

export function addTodoChild(nodes: TodoNode[], id: string, child: TodoNode): TodoNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, children: [...node.children, child] };
    if (node.children.length) return { ...node, children: addTodoChild(node.children, id, child) };
    return node;
  });
}

export function addTodoSibling(
  nodes: TodoNode[],
  id: string,
  position: 'above' | 'below',
  sibling: TodoNode
): TodoNode[] {
  const idx = nodes.findIndex((node) => node.id === id);
  if (idx !== -1) {
    const at = position === 'below' ? idx + 1 : idx;
    const copy = [...nodes];
    copy.splice(at, 0, sibling);
    return copy;
  }
  return nodes.map((node) =>
    node.children.length
      ? { ...node, children: addTodoSibling(node.children, id, position, sibling) }
      : node
  );
}

export function deleteTodoNode(nodes: TodoNode[], id: string): TodoNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children.length ? { ...node, children: deleteTodoNode(node.children, id) } : node
    );
}

export function updateTodoNode(
  nodes: TodoNode[],
  id: string,
  patch: Partial<TodoNode>
): TodoNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...patch };
    if (node.children.length)
      return { ...node, children: updateTodoNode(node.children, id, patch) };
    return node;
  });
}

export function flattenTodoNodes(nodes: TodoNode[]): TodoNode[] {
  const result: TodoNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length) result.push(...flattenTodoNodes(node.children));
  }
  return result;
}

/**
 * Reconstructs the hierarchical To Do tree (tabbed by project) from the API's
 * flat `tasks[]`. Parent/child links are derived from dot-segmented codes
 * (`A.1`'s parent is the node coded `A`), which requires each code's parent
 * code to already exist in the same project's task list — true for any tree
 * this domain itself produced via `computeTodoCodes`.
 */
export function unflattenTasksToTodoTree(tasks: MeetingTaskApiResponse[]): MomTodoByTab {
  const byProject = new Map<string, MeetingTaskApiResponse[]>();
  for (const task of tasks) {
    const tabId = task.projectId ?? GENERAL_TODO_TAB_ID;
    const list = byProject.get(tabId) ?? [];
    list.push(task);
    byProject.set(tabId, list);
  }

  const result: MomTodoByTab = {};
  for (const [tabId, projectTasks] of byProject) {
    const sorted = [...projectTasks].sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true })
    );
    const nodesByCode = new Map<string, TodoNode>();
    const roots: TodoNode[] = [];

    for (const task of sorted) {
      const node: TodoNode = {
        id: task.id,
        task: task.title,
        taskType: task.taskType,
        assignedToEmployeeId: task.assignedToEmployee?.id ?? null,
        assignedToEmployeeName: task.assignedToEmployee?.name ?? null,
        children: [],
      };
      nodesByCode.set(task.code, node);

      const lastDotIndex = task.code.lastIndexOf('.');
      const parentCode = lastDotIndex === -1 ? null : task.code.slice(0, lastDotIndex);
      const parent = parentCode ? nodesByCode.get(parentCode) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    result[tabId] = roots;
  }

  return result;
}
