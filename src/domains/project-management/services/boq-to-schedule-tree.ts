import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { ProjectBOQItem } from '@/domains/project-control';
import type { ScheduleTask } from '../types/schedule';

function computeDuration(startDate: string, endDate: string): number {
  const diff = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
  return Math.max(diff, 1);
}

function mapBOQItemToScheduleTask(item: ProjectBOQItem): ScheduleTask | null {
  const children = mapBOQItemsToScheduleTasks(item.children);

  let startDate = item.scheduleStartDate;
  let endDate = item.scheduleEndDate;

  if (!startDate || !endDate) {
    if (children.length === 0) return null;
    startDate = children.reduce(
      (min, c) => (c.startDate < min ? c.startDate : min),
      children[0].startDate
    );
    endDate = children.reduce((max, c) => (c.endDate > max ? c.endDate : max), children[0].endDate);
  }

  return {
    id: item.id,
    taskName: item.name,
    startDate,
    endDate,
    duration: computeDuration(startDate, endDate),
    weight: item.weight != null ? Number(item.weight) : null,
    progress: item.taskMonitoring?.percentageDoneTask ?? 0,
    children,
  };
}

export function mapBOQItemsToScheduleTasks(items: ProjectBOQItem[]): ScheduleTask[] {
  return items.map(mapBOQItemToScheduleTask).filter((task): task is ScheduleTask => task !== null);
}
