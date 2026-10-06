import { describe, expect, it } from 'vitest';
import type { ScheduleTask } from '../../types/schedule';
import { filterScheduleTree } from '../filter-schedule-tree';

const makeTask = (id: string, taskName: string, children: ScheduleTask[] = []): ScheduleTask => ({
  id,
  taskName,
  startDate: '2026-01-01',
  endDate: '2026-01-10',
  duration: 10,
  weight: 10,
  progress: 50,
  children,
});

describe('filterScheduleTree', () => {
  const tasks = [
    makeTask('1', 'Persiapan', [makeTask('1a', 'Survey Lokasi'), makeTask('1b', 'Perizinan')]),
    makeTask('2', 'Struktur', [makeTask('2a', 'Pondasi'), makeTask('2b', 'Beton')]),
  ];

  const codes = new Map([
    ['1', 'A'],
    ['1a', 'A.1'],
    ['1b', 'A.2'],
    ['2', 'B'],
    ['2a', 'B.1'],
    ['2b', 'B.2'],
  ]);

  it('returns all tasks when query is empty', () => {
    expect(filterScheduleTree(tasks, '', codes)).toHaveLength(2);
  });

  it('filters by task name (case-insensitive)', () => {
    const result = filterScheduleTree(tasks, 'pondasi', codes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].id).toBe('2a');
  });

  it('filters by task code', () => {
    const result = filterScheduleTree(tasks, 'A.2', codes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].id).toBe('1b');
  });

  it('keeps parent visible when child matches', () => {
    const result = filterScheduleTree(tasks, 'Survey', codes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].children).toHaveLength(1);
  });

  it('returns empty array when no matches', () => {
    expect(filterScheduleTree(tasks, 'xyz', codes)).toHaveLength(0);
  });
});
