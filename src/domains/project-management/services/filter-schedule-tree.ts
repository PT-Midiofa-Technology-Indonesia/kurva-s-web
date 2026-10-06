import type { ScheduleTask } from '../types/schedule';

export function filterScheduleTree(
  nodes: ScheduleTask[],
  query: string,
  codes: Map<string, string>
): ScheduleTask[] {
  const k = query.toLowerCase().trim();
  if (!k) return nodes;

  const walk = (list: ScheduleTask[]): ScheduleTask[] =>
    list.reduce<ScheduleTask[]>((acc, node) => {
      const taskNameMatch = node.taskName.toLowerCase().includes(k);
      const codeMatch = (codes.get(node.id) ?? '').toLowerCase().includes(k);
      const filteredChildren = walk(node.children);

      if (taskNameMatch || codeMatch || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);

  return walk(nodes);
}
