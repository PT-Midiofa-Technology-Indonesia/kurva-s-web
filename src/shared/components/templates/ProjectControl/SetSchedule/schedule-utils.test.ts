import { describe, expect, it } from 'vitest';
import {
  buildLeafDependencies,
  constrainParentDates,
  isLastLeaf,
  recalcDays,
  recalcParentDates,
  shiftNodeAndChildren,
  updateNode,
} from './schedule-utils';
import type { ScheduleNode } from './types';

function node(patch: Partial<ScheduleNode> = {}): ScheduleNode {
  return {
    id: 'x',
    taskName: 'Task',
    startDate: '2026-06-01',
    endDate: '2026-06-01',
    days: 1,
    bobot: null,
    percent: 0,
    children: [],
    ...patch,
  };
}

describe('schedule-utils parent/leaf date rules', () => {
  it('recalculates parent dates from child bounds after a leaf changes', () => {
    const tree = [
      node({
        id: 'parent',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
        children: [node({ id: 'leaf', startDate: '2026-06-01', endDate: '2026-06-05' })],
      }),
    ];

    const next = recalcDays(recalcParentDates(updateNode(tree, 'leaf', { endDate: '2026-06-12' })));

    expect(next[0].startDate).toBe('2026-06-01');
    expect(next[0].endDate).toBe('2026-06-12');
    expect(next[0].days).toBe(12);
  });

  it('constrains parent shrink to still cover children', () => {
    const parent = node({
      id: 'parent',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      children: [node({ id: 'leaf', startDate: '2026-06-05', endDate: '2026-06-20' })],
    });

    expect(
      constrainParentDates(parent, { startDate: '2026-06-10', endDate: '2026-06-15' })
    ).toEqual({
      startDate: '2026-06-05',
      endDate: '2026-06-20',
    });
  });

  it('returns empty dependencies map - no arrows on leaf nodes', () => {
    const dependencies = buildLeafDependencies([
      node({
        id: 'parent',
        children: [node({ id: 'leaf-1' }), node({ id: 'leaf-2' }), node({ id: 'leaf-3' })],
      }),
    ]);

    expect(dependencies.size).toBe(0);
    expect(dependencies.get('parent')).toBeUndefined();
    expect(dependencies.get('leaf-1')).toBeUndefined();
    expect(dependencies.get('leaf-2')).toBeUndefined();
    expect(dependencies.get('leaf-3')).toBeUndefined();
  });
});

describe('isLastLeaf', () => {
  it('returns true for node without children', () => {
    expect(isLastLeaf(node({ children: [] }))).toBe(true);
  });
  it('returns false for node with children', () => {
    expect(isLastLeaf(node({ children: [node()] }))).toBe(false);
  });
});

describe('shiftNodeAndChildren', () => {
  it('shifts node dates by delta', () => {
    const testNode = node({ startDate: '2026-06-01', endDate: '2026-06-10' });
    const shifted = shiftNodeAndChildren(testNode, 5);
    expect(shifted.startDate).toBe('2026-06-06');
    expect(shifted.endDate).toBe('2026-06-15');
  });
  it('shifts children recursively', () => {
    const child = node({ startDate: '2026-06-01', endDate: '2026-06-05' });
    const parent = node({ startDate: '2026-06-01', endDate: '2026-06-10', children: [child] });
    const shifted = shiftNodeAndChildren(parent, 3);
    expect(shifted.children[0].startDate).toBe('2026-06-04');
  });
  it('negative delta shifts backward', () => {
    const testNode = node({ startDate: '2026-06-10', endDate: '2026-06-20' });
    const shifted = shiftNodeAndChildren(testNode, -5);
    expect(shifted.startDate).toBe('2026-06-05');
  });
});
