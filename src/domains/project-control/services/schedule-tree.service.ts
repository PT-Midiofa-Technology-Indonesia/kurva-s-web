import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { ScheduleNode } from '@/shared/components/templates';
import type { ProjectBOQItem } from '../api/get-project-boq';
import type { SyncProjectBOQScheduleItemPayload } from '../api/sync-project-boq-schedule';

function toScheduleDate(value: string | null, fallback: string): string {
  if (!value) return fallback;
  try {
    return format(parseISO(value), 'yyyy-MM-dd');
  } catch {
    return fallback;
  }
}

function computeScheduleDays(startDate: string, endDate: string): number {
  return Math.max(differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1, 1);
}

export function mapBoqItemsToScheduleNodes(items: ProjectBOQItem[]): ScheduleNode[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  return items.map((item) => {
    const startDate = toScheduleDate(item.scheduleStartDate, today);
    const endDate = toScheduleDate(item.scheduleEndDate, today);
    return {
      id: item.id,
      taskName: item.name,
      startDate,
      endDate,
      days: computeScheduleDays(startDate, endDate),
      bobot: item.weight ? Number(item.weight) : null,
      percent: 0,
      children: mapBoqItemsToScheduleNodes(item.children),
    };
  });
}

export function collectScheduleIds(nodes: ScheduleNode[]): Set<string> {
  const ids = new Set<string>();
  const walk = (list: ScheduleNode[]) => {
    for (const node of list) {
      ids.add(node.id);
      if (node.children.length > 0) walk(node.children);
    }
  };
  walk(nodes);
  return ids;
}

export function flattenScheduleTree(
  nodes: ScheduleNode[],
  originalIds: Set<string>
): SyncProjectBOQScheduleItemPayload[] {
  const result: SyncProjectBOQScheduleItemPayload[] = [];
  const walk = (list: ScheduleNode[]) => {
    list.forEach((node, index) => {
      result.push({
        id: originalIds.has(node.id) ? node.id : null,
        sortOrder: index + 1,
        name: node.taskName,
        scheduleStartDate: node.startDate,
        scheduleEndDate: node.endDate,
      });
      if (node.children.length > 0) walk(node.children);
    });
  };
  walk(nodes);
  return result;
}
