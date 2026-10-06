import { describe, expect, it } from 'vitest';
import type { ProjectBOQItem } from '@/domains/project-control';
import { mapBOQItemsToScheduleTasks } from '../boq-to-schedule-tree';

const makeItem = (patch: Partial<ProjectBOQItem>): ProjectBOQItem => ({
  id: 'id',
  parentId: null,
  sortOrder: 0,
  level: 0,
  code: 'A',
  name: 'Task',
  isFinalLevel: true,
  weight: null,
  scheduleStartDate: null,
  scheduleEndDate: null,
  children: [],
  ...patch,
});

describe('mapBOQItemsToScheduleTasks', () => {
  it('maps scheduleStartDate/scheduleEndDate into startDate/endDate', () => {
    const [task] = mapBOQItemsToScheduleTasks([
      makeItem({
        id: '1',
        name: 'Persiapan',
        scheduleStartDate: '2026-01-05',
        scheduleEndDate: '2026-01-10',
      }),
    ]);
    expect(task.startDate).toBe('2026-01-05');
    expect(task.endDate).toBe('2026-01-10');
    expect(task.duration).toBe(6);
  });

  it('parses weight and progress from item fields', () => {
    const [task] = mapBOQItemsToScheduleTasks([
      makeItem({
        id: '1',
        weight: '12.5',
        scheduleStartDate: '2026-01-01',
        scheduleEndDate: '2026-01-01',
        taskMonitoring: {
          assignedEmployees: [],
          manpowerTask: 0,
          qcTask: 0,
          totalScheduleDays: 1,
          weightItem: '12.5',
          totalTask: 4,
          totalDoneTask: 2,
          percentageDoneTask: 50,
          status: 'in-progress',
          statusLabel: 'In Progress',
        },
      }),
    ]);
    expect(task.weight).toBe(12.5);
    expect(task.progress).toBe(50);
  });

  it('derives dates for a group item from its children when the item has no own dates', () => {
    const [task] = mapBOQItemsToScheduleTasks([
      makeItem({
        id: 'parent',
        scheduleStartDate: null,
        scheduleEndDate: null,
        children: [
          makeItem({ id: 'c1', scheduleStartDate: '2026-02-01', scheduleEndDate: '2026-02-05' }),
          makeItem({ id: 'c2', scheduleStartDate: '2026-01-20', scheduleEndDate: '2026-02-10' }),
        ],
      }),
    ]);
    expect(task.startDate).toBe('2026-01-20');
    expect(task.endDate).toBe('2026-02-10');
    expect(task.children).toHaveLength(2);
  });

  it('excludes items that have no own dates and no dated descendants', () => {
    const result = mapBOQItemsToScheduleTasks([
      makeItem({ id: '1', scheduleStartDate: null, scheduleEndDate: null }),
    ]);
    expect(result).toHaveLength(0);
  });

  it('defaults progress to 0 when taskMonitoring is absent', () => {
    const [task] = mapBOQItemsToScheduleTasks([
      makeItem({ id: '1', scheduleStartDate: '2026-01-01', scheduleEndDate: '2026-01-01' }),
    ]);
    expect(task.progress).toBe(0);
  });
});
