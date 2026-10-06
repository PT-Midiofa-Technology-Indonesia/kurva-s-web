import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleNode } from '@/shared/components/templates';
import type { ProjectBOQItem } from '../../api/get-project-boq';
import {
  collectScheduleIds,
  flattenScheduleTree,
  mapBoqItemsToScheduleNodes,
} from '../schedule-tree.service';

function boqItem(
  patch: Partial<ProjectBOQItem> & Pick<ProjectBOQItem, 'id' | 'name'>
): ProjectBOQItem {
  return {
    parentId: null,
    sortOrder: 1,
    level: 1,
    code: 'A',
    isFinalLevel: false,
    weight: null,
    scheduleStartDate: null,
    scheduleEndDate: null,
    children: [],
    ...patch,
  };
}

function scheduleNode(
  patch: Partial<ScheduleNode> & Pick<ScheduleNode, 'id' | 'taskName'>
): ScheduleNode {
  return {
    startDate: '2026-06-01',
    endDate: '2026-06-01',
    days: 1,
    bobot: null,
    percent: 0,
    children: [],
    ...patch,
  };
}

describe('mapBoqItemsToScheduleNodes', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps a nested BOQ item tree into schedule nodes', () => {
    const items: ProjectBOQItem[] = [
      boqItem({
        id: 'a',
        name: 'Pekerjaan Bangunan Office',
        weight: '10.0000',
        scheduleStartDate: '2026-06-01',
        scheduleEndDate: '2026-08-30',
        children: [
          boqItem({
            id: 'a1',
            name: 'Pekerjaan Civil',
            parentId: 'a',
            level: 2,
            weight: '5.0000',
            scheduleStartDate: '2026-06-01',
            scheduleEndDate: '2026-06-02',
          }),
        ],
      }),
    ];

    expect(mapBoqItemsToScheduleNodes(items)).toEqual([
      {
        id: 'a',
        taskName: 'Pekerjaan Bangunan Office',
        startDate: '2026-06-01',
        endDate: '2026-08-30',
        days: 91,
        bobot: 10,
        percent: 0,
        children: [
          {
            id: 'a1',
            taskName: 'Pekerjaan Civil',
            startDate: '2026-06-01',
            endDate: '2026-06-02',
            days: 2,
            bobot: 5,
            percent: 0,
            children: [],
          },
        ],
      },
    ]);
  });

  it('falls back to today when schedule dates are null', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T00:00:00Z'));

    const items: ProjectBOQItem[] = [boqItem({ id: 'a', name: 'Task A' })];

    const result = mapBoqItemsToScheduleNodes(items);

    expect(result[0].startDate).toBe('2026-07-04');
    expect(result[0].endDate).toBe('2026-07-04');
    expect(result[0].days).toBe(1);
  });

  it('maps a missing weight to a null bobot', () => {
    const items: ProjectBOQItem[] = [boqItem({ id: 'a', name: 'Task A', weight: null })];

    expect(mapBoqItemsToScheduleNodes(items)[0].bobot).toBeNull();
  });
});

describe('collectScheduleIds', () => {
  it('collects every node id in the tree, including nested children', () => {
    const nodes: ScheduleNode[] = [
      scheduleNode({
        id: 'a',
        taskName: 'A',
        children: [scheduleNode({ id: 'a1', taskName: 'A1' })],
      }),
    ];

    expect(collectScheduleIds(nodes)).toEqual(new Set(['a', 'a1']));
  });
});

describe('flattenScheduleTree', () => {
  it('nulls ids not present in the original set and assigns sibling sortOrder', () => {
    const nodes: ScheduleNode[] = [
      scheduleNode({
        id: 'a',
        taskName: 'Renamed A',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        children: [
          scheduleNode({
            id: 'a1',
            taskName: 'A1',
            startDate: '2026-06-01',
            endDate: '2026-06-02',
          }),
          scheduleNode({
            id: 'new-node-id',
            taskName: 'New Task',
            startDate: '2026-06-03',
            endDate: '2026-06-03',
          }),
        ],
      }),
    ];
    const originalIds = new Set(['a', 'a1']);

    expect(flattenScheduleTree(nodes, originalIds)).toEqual([
      {
        id: 'a',
        sortOrder: 1,
        name: 'Renamed A',
        scheduleStartDate: '2026-06-01',
        scheduleEndDate: '2026-06-05',
      },
      {
        id: 'a1',
        sortOrder: 1,
        name: 'A1',
        scheduleStartDate: '2026-06-01',
        scheduleEndDate: '2026-06-02',
      },
      {
        id: null,
        sortOrder: 2,
        name: 'New Task',
        scheduleStartDate: '2026-06-03',
        scheduleEndDate: '2026-06-03',
      },
    ]);
  });
});
